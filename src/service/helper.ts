import Vue from 'vue';
import { ClassMetaData } from '../di/class_meta';
import { DIMetaData } from '../di/di_meta';
import { IStateModule } from '../module/module';
import { assert, def } from '../util';
import { Middleware } from './middleware';
import { IVubxOption } from './observable';
import { IService, Service } from './service';

export interface IConstructor { new(...args: any[]): {}; }

export interface IServiceClass<T> { new(...args: any[]): T; }

export type IIdentifier = string;

export type IPlugin = (service: IService) => void;

const defaultConfig = {
    enumerable: true,
    configurable: true
};

export class ScopeData {
    public $vm: Vue;
    public $getters: any = {};
    public $state: any = {};
    public isRoot: boolean;
    public isCommitting: boolean = false;
    public middleware: Middleware = new Middleware();
    public vubxOption: IVubxOption;

    public module: IStateModule;

    get globalPlugins (): IPlugin[] {
        return this.module._globalPlugins;
    }

    get globalMiddlewate (): Middleware {
        return this.module._globalMiddleware;
    }

    constructor (vubxOption: IVubxOption) {
        this.vubxOption = vubxOption;
    }
}

export function proxyState (ctx: any, getterKeys: string[]) {
    const $state = (ctx as IService).__scope__.$state;
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
    def(ctx, '$state', {
        value: $state,
        enumerable: false
    });
}

export function proxyGetters (ctx: any, getterKeys: string[]) {
    const $getters = (ctx as IService).__scope__.$getters;
    getterKeys.forEach((key) => {
        def($getters, key, {
            get: () => ctx[key],
            set: (value) => ctx[key] = value,
            ...defaultConfig
        });
    });
    def(ctx, '$getters', {
        value: $getters,
        enumerable: false,
        configurable: false
    });
}

export function definedComputed (proto: any, getterKeys: string[]) {
    getterKeys.forEach((key) => {
        def(proto, key, {
            get (this: IService) {
                return this.__scope__.$vm[key];
            },
            enumerable: true,
            configurable: true
        });
    });
}

export function getAllGetters (target: any) {
    let getters = {};
    let prototypeSuper = target;
    while (
        prototypeSuper !== Service.prototype
        && prototypeSuper !== Object.prototype
        && prototypeSuper !== null) {
        getters = {
            ...getPropertyGetters(prototypeSuper),
            ...getters
        };
        prototypeSuper = Object.getPrototypeOf(prototypeSuper);
    }
    return getters;
}

export function getPropertyGetters (target: any): { [key: string]: { get (): any, set?(): void } } {
    const getters = {};
    const injectMeta = ClassMetaData.get(target).injectMeta;
    const keys: string[] = Object.getOwnPropertyNames(target);
    keys.forEach((key) => {
        // skip @lazyInject
        if (key === 'constructor' || injectMeta.has(key)) { return; }
        const descriptor = Object.getOwnPropertyDescriptor(target, key);
        if (descriptor && descriptor.get) {
            getters[key] = {
                get: descriptor.get,
                set: descriptor.set && descriptor.set
            };
        }
    });
    return getters;
}

export function useStrict (service: IService) {
    const identifier = DIMetaData.get(service).identifier;
    if (process.env.NODE_ENV !== 'production') {
        service.__scope__.$vm && service.__scope__.$vm.$watch<any>(() => {
            return service.$state;
        }, () => {
            assert(service.__scope__.isCommitting,
                `Do not mutate vubx service[${String(identifier)}] data outside mutation handlers.`);
        }, { deep: true, sync: true }
        );
    }
}
