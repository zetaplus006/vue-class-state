import { def, assert } from '../util';
import Vue from 'vue';
import { IService, Service } from './service';

export type IConstructor = { new(...args: any[]): {}; };

export type IServiceClass<T extends IService> = { new(...args: any[]): T; };

export type IIdentifier = string | symbol;

export type IPlugin = (service: IService) => void;

const defaultConfig = {
    enumerable: true,
    configurable: true
};

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
    (parent: P, childName: keyof P, child: C, identifier: IIdentifier) {
    parent.__.$children.push(child);
    if (child.__.$parent.indexOf(parent) <= -1) {
        child.__.$parent.push(parent);
    }
    if (process.env.NODE_ENV !== 'production') {
        assert(parent.__.$root,
            'Make sure to have a root service, ' +
            'Please check the root options in the decorator configuration');
    }
    child.__.$root = parent.__.$root;
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