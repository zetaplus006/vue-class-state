import { def, assert } from '../util';
import Vue from 'vue';
import { IService, Service } from './service';
import { Middleware } from './middleware';
import { Provider } from '../di/provider';
import { IVubxOption } from './observable';
import { ClassMetaData } from '../di/class_meta';
import { DIMetaData } from '../di/di_meta';
import { StateModule } from '../module/module';

export type IConstructor = { new(...args: any[]): {}; };

export type IServiceClass<T> = { new(...args: any[]): T; };

export type IIdentifier = string;

export type IPlugin = (service: IService) => void;

const defaultConfig = {
    enumerable: true,
    configurable: true
};

export class ScopeData {
    $vm: Vue;
    $getters: any = {};
    $state: any = {};
    isRoot: boolean;
    isCommitting: boolean = false;
    middleware: Middleware = new Middleware();
    vubxOption: IVubxOption;

    module: StateModule;

    /*     private _root: IService;
        get $root(): IService {
            assert(this._root, 'There must be a root Service and please check your decorator option , or confirm your class has extends Service class');
            return this._root;
        }
        set $root(value: IService) {
            this._root = value;
        } */

    get globalPlugins(): IPlugin[] {
        return this.module['_globalPlugins'];
    }

    get globalMiddlewate(): Middleware {
        return this.module['_globalMiddleware'];
    }

    constructor(service: IService, vubxOption: IVubxOption) {
        // this.isRoot = !!vubxOption.root;
        /* if (this.isRoot) {
            this._root = service;
            this._globalMiddllewate = new Middleware();
            this._globalPlugins = vubxOption.globalPlugins || [];
        } else if (vubxOption.globalPlugins.length > 0) {
            assert(false, 'The globalPlugins option only to be used in root service');
        } */
        this.vubxOption = vubxOption;
    }
}

export function proxyState(ctx: any, getterKeys: string[]) {
    const $state = (ctx as IService).__scope__.$state;
    Object.keys(ctx).forEach(
        key => {
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

export function proxyGetters(ctx: any, vm: Vue, getterKeys: string[]) {
    const $getters = (ctx as IService).__scope__.$getters;
    getterKeys.forEach(key => {
        // def(ctx, key, {
        //     get: () => vm[key],
        //     set: value => vm[key] = value,
        //     enumerable: false,
        //     configurable: true
        // });
        def($getters, key, {
            get: () => ctx[key],
            set: value => ctx[key] = value,
            ...defaultConfig
        });
    });
    def(ctx, '$getters', {
        value: $getters,
        enumerable: false,
        configurable: false
    });
}

export function definedComputed(proto: Object, getterKeys: string[]) {
    const $getters = {};
    getterKeys.forEach(key => {
        def(proto, key, {
            get(this: IService) {
                return this.__scope__.$vm[key];
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

export function getPropertyGetters(target: any): { [key: string]: { get(): any, set?(): void } } {
    const getters = {};
    const injectMeta = ClassMetaData.get(target).injectMeta;
    const keys: string[] = Object.getOwnPropertyNames(target);
    keys.forEach(key => {
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

export function useStrict(service: IService) {
    const identifier = DIMetaData.get(service).identifier;
    if (process.env.NODE_ENV !== 'production') {
        service.__scope__.$vm && service.__scope__.$vm.$watch<any>(function () {
            return service.$state;
        }, (val) => {
            assert(service.__scope__.isCommitting,
                `Do not mutate vubx service[${String(identifier)}] data outside mutation handlers.`);
        }, { deep: true, sync: true });
    }
}
