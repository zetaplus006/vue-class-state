
import { DIMetaData } from '../di/di_meta';
import { watcherKey } from '../state/computed';
import { assert, defGet, hideProperty } from '../util';
import { ScopeData, scopeKey } from './scope';
import { Watcher } from './watcher';

export interface IConstructor { new(...args: any[]): any; }

export interface IClass<T> { new(...args: any[]): T; }

export type IIdentifier = string;

export type IPlugin = (state: any) => void;

export function proxyState(ctx: any, key: string) {
    const $state = ScopeData.get(ctx).$state;
    defGet($state, key, () => ctx[key]);
}

export function useStrict(state: any) {
    const identifier = DIMetaData.get(state).identifier,
        scope = state[scopeKey] as ScopeData || undefined;
    if (process.env.NODE_ENV !== 'production' && scope) {
        if (!state[watcherKey]) {
            hideProperty(state, watcherKey, []);
        }
        new Watcher(state, () => {
            return scope.$state;
        }, () => {
            assert(state.__scope__.isCommitting,
                `Do not mutate state[${identifier}] data outside mutation handlers.`);
        }, { deep: true, sync: true } as any
        );
    }
}

/*
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
    const injectMeta = ClassMetaData.get(target).injectPropertyMeta;
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
 */
