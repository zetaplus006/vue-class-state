
import { ClassMetaData } from '../di/class_meta';
import { DIMetaData } from '../di/di_meta';

import { assert, def } from '../util';

import { IMutation } from './mutation';
import { ScopeData, scopeKey } from './scope';

export interface IConstructor { new(...args: any[]): {}; }

export interface IstateClass<T> { new(...args: any[]): T; }

export type IIdentifier = string;

export type IPlugin = (state: any) => void;

const defaultConfig = {
    enumerable: true,
    configurable: true
};

export type IMutationSubscribe = (mutation: IMutation, state: any) => any;

export interface IMutationSubscribeOption {
    before?: IMutationSubscribe;
    after?: IMutationSubscribe;
}

export function proxyState(ctx: any, getterKeys: string[]) {
    const $state = ScopeData.get(ctx)!.$state;
    Object.keys(ctx).forEach(
        (key) => {
            if (getterKeys.indexOf(key) < 0) {
                def($state, key, {
                    get: () => ctx[key],
                    ...defaultConfig
                });
            }
        }
    );
}

export function proxyGetters(ctx: any, getterKeys: string[]) {
    const $getters = ScopeData.get(ctx)!.$getters;
    getterKeys.forEach((key) => {
        def($getters, key, {
            get: () => ctx[key],
            set: (value) => ctx[key] = value,
            ...defaultConfig
        });
    });
}

export function definedComputed(proto: any, getterKeys: string[]) {
    getterKeys.forEach((key) => {
        def(proto, key, {
            get(this: any) {
                return (this[scopeKey] as ScopeData).$vm[key];
            },
            enumerable: true,
            configurable: true
        });
    });
}

export function getAllGetters(target: any) {
    let getters = {};
    let prototypeSuper = target;
    while (
        prototypeSuper !== Object.prototype
        && prototypeSuper !== null) {
        getters = {
            ...getPropertyGetters(prototypeSuper),
            ...getters
        };
        prototypeSuper = Object.getPrototypeOf(prototypeSuper);
    }
    return getters;
}

export function getPropertyGetters(target: any): { [key: string]: { get(): any, set?(): void } } {
    const getters = {};
    const injectMeta = ClassMetaData.get(target).injectMeta;
    const keys: string[] = Object.getOwnPropertyNames(target);
    keys.forEach((key) => {
        // skip @lazyInject
        if (key === 'constructor' || injectMeta.has(key)) { return; }
        const descriptor = Object.getOwnPropertyDescriptor(target, key);
        if (descriptor && descriptor.get) {
            getters[key] = {
                get: descriptor.get
            };
        }
    });
    return getters;
}

export function useStrict(state: any) {
    const identifier = DIMetaData.get(state).identifier, scope = ScopeData.get(state);
    if (process.env.NODE_ENV !== 'production' && scope) {
        scope.$vm && scope.$vm.$watch<any>(() => {
            return scope.$state;
        }, () => {
            assert(state.__scope__.isCommitting,
                `Do not mutate vubx state[${String(identifier)}] data outside mutation handlers.`);
        }, { deep: true, sync: true } as any
        );
    }
}

export function replaceState(targetState: any, state: any): void {
    const scope = ScopeData.get(targetState);
    if (scope === null) return;
    const temp = scope.isCommitting;
    scope.isCommitting = true;
    for (const key in state) {
        if (targetState.hasOwnProperty(key)) {
            targetState[key] = state[key];
        }
    }
    scope.isCommitting = temp;
}

export function subscribe(targetState: any, option: IMutationSubscribeOption) {
    const scope = ScopeData.get(targetState);
    if (scope) {
        scope.middleware.subscribe(option);
    }
}
