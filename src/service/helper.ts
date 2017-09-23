import { def, assert } from '../util';
import Vue from 'vue';
import { IService, Service } from './service';
import { Middleware } from './middleware';
import { Provider } from '../di/provider';
import { IVubxOption } from './observable';
import { expect } from 'chai';

export type IConstructor = { new(...args: any[]): {}; };

export type IServiceClass<T extends IService> = { new(...args: any[]): T; };

export type IIdentifier = string | symbol;

export type IPlugin = (service: IService) => void;

const defaultConfig = {
    enumerable: true,
    configurable: true
};

export class VubxHelper {
    $vm: Vue;
    $getters: any = {};
    $state: any = {};
    $parent: IService[] = [];
    $children: IService[] = [];
    isCommitting: boolean = false;
    middleware: Middleware = new Middleware();
    hasBeenInjected: boolean = false;
    identifier: IIdentifier;
    isRoot: boolean;
    vubxOption: IVubxOption;

    private _root: IService;
    get $root(): IService {
        assert(this._root, 'There must be a root Service and please check your decorator option');
        return this._root;
    }
    set $root(value: IService) {
        this._root = value;
    }

    private _provider: Provider;
    get provider(): Provider {
        return this.$root.__._provider;
    }

    private _globalPlugins: IPlugin[];
    get globalPlugins(): IPlugin[] {
        return this.$root.__._globalPlugins;
    }

    set globalPlugins(value: IPlugin[]) {
        this.$root.__._globalPlugins = value;
    }

    private _globalMiddllewate: Middleware;
    get globalMiddlewate(): Middleware {
        return this.$root.__._globalMiddllewate;
    }

    constructor(service: IService, vubxOption: IVubxOption) {
        this.isRoot = !!vubxOption.root;
        if (this.isRoot) {
            this._root = service;
            this._provider = new Provider(service);
            this._globalMiddllewate = new Middleware();
            this._globalPlugins = vubxOption.globalPlugins || [];
        } else if (vubxOption.globalPlugins.length > 0) {
            assert(false, 'The globalPlugins option only to be used in root service');
        }
        this.identifier = vubxOption.identifier;
        this.vubxOption = vubxOption;
    }
}

export function proxyState(ctx: any, getterKeys: string[]) {
    const $state = (ctx as IService).__.$state;
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
}

export function proxyGetters(ctx: any, vm: Vue, getterKeys: string[]) {
    const $getters = (ctx as IService).__.$getters;
    getterKeys.forEach(key => {
        def(ctx, key, {
            get: () => vm[key],
            set: value => vm[key] = value,
            ...defaultConfig
        });
        def($getters, key, {
            get: () => ctx[key],
            set: value => ctx[key] = value,
            ...defaultConfig
        });
    });
}

const vmMethods = ['$watch', '$on', '$once', '$emit', '$off', '$set', '$delete', '$destroy'];

export function proxyMethod(ctx: any, vm: Vue) {
    for (const key of vmMethods) {
        def(ctx, key, {
            get() {
                const method = vm[key].bind(vm);
                def(this, key, {
                    value: method
                });
                return method;
            },
            enumerable: false,
            configurable: true
        });
    }
}

export function getAllGetters(target: any, ctx: any) {
    let getters = {};
    let prototypeSuper = target;
    while (
        prototypeSuper !== Service.prototype
        && prototypeSuper !== Object.prototype
        && prototypeSuper !== null) {
        getters = {
            ...getPropertyGetters(prototypeSuper, ctx),
            ...getters
        };
        prototypeSuper = Object.getPrototypeOf(prototypeSuper);
    }
    return getters;
}

export function getPropertyGetters(target: any, ctx: any): { [key: string]: { get(): any, set?(): void } } {
    const getters = {};
    const keys: string[] = Object.getOwnPropertyNames(target);
    keys.forEach(key => {
        if (key === 'constructor') { return; }
        const descriptor = Object.getOwnPropertyDescriptor(target, key);
        if (descriptor.get) {
            getters[key] = {
                get: descriptor.get.bind(ctx),
                set: descriptor.set && descriptor.set.bind(ctx)
            };
        }
    });
    return getters;
}

export function appendServiceChild<P extends Service, C extends Service>
    (parent: P, childName: keyof P, child: C, identifier: IIdentifier, root?: Service) {
    parent.__.$children.push(child);
    if (child.__.$parent.indexOf(parent) <= -1) {
        child.__.$parent.push(parent);
    }
    if (process.env.NODE_ENV !== 'production') {
        assert(parent.__.$root,
            'Make sure to have a root service, ' +
            'Please check the root options in the decorator configuration');
    }
    // child.__.$root = parent.__.$root;
    if (root) {
        child.__.$root = root;
    }
    child.__.identifier = identifier;
    def(parent.__.$state, childName, {
        get: () => child.__.$state,
        ...defaultConfig
    });
    def(parent.__.$getters, childName, {
        get: () => child.__.$getters,
        ...defaultConfig
    });
}