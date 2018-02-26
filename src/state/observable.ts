import Vue, { VueConstructor } from 'vue';
import { ClassMetaData, IGetters } from '../di/class_meta';
import { DIMetaData } from '../di/di_meta';
import { assert, def, hideProperty } from '../util';
import {
    definedComputed, IConstructor, IPlugin,
    proxyGetters, proxyState
} from './helper';
import { ICreatedHook } from './hook';
import { ScopeData, scopeKey } from './scope';

export interface IVubxOption {
    plugins: IPlugin[];
    createdHook: ICreatedHook;
}

export function createDecorator(vueConstructor: VueConstructor): ClassDecorator {
    // tslint:disable-next-line:ban-types
    return function <TFunction extends Function>(constructor: TFunction): any {
        return createStateClass(vueConstructor, constructor as any);
    };
}

export function createStateClass(
    vueConstructor: VueConstructor,
    constructor: IConstructor) {

    const classMeta = ClassMetaData.collectGetterMeta(constructor.prototype);
    definedComputed(constructor.prototype, classMeta.getterKeys);

    return class $State extends constructor {
        constructor(...arg: any[]) {
            super(...arg);
            const meta = ClassMetaData.get(constructor.prototype);

            const vm: Vue = new vueConstructor({
                data: this,
                computed: bindGetters(meta.getterMeta, meta.getterKeys, this)
            });

            const option: IVubxOption = {
                plugins: [],
                createdHook: meta.hookMeta
            };
            const scope = new ScopeData(option);
            hideProperty(this, scopeKey, scope);
            scope.$vm = vm;
            proxyState(this, meta.getterKeys);
            proxyGetters(this, meta.getterKeys);
        }
    };
}

export function createdHook(state: any, option: IVubxOption, diMeta: DIMetaData) {
    initPlugins(state, ScopeData.get(state)!.globalPlugins.concat(option.plugins));
    const hook = option.createdHook;
    if (hook) {
        const deps = diMeta.provider.getAll(hook.deps);
        hook.method.apply(state, deps);
    }
}

function initPlugins(ctx: any, plugin: IPlugin[]) {
    plugin.forEach((action) => action(ctx));
}

function bindGetters(getters: IGetters, keys: string[], ctx: object) {
    const returnGetters = {};
    keys.forEach((key) => {
        returnGetters[key] = {
            get: getters[key].get.bind(ctx)
        };
    });
    return returnGetters;
}

export function State(target: object, propertyKey: string) {
    def(target, propertyKey, {
        get() {
            assert(false, 'must be init data');
        },
        set(value) {
            checkScope(this, target);
            Vue.util.defineReactive(this, propertyKey, value);
        },
        enumerable: true,
        configurable: true
    });
}

export function getter(target: object, propertyKey: string) {
    ClassMetaData.addGetterMeta(target, propertyKey);
    return {
        get() {
            /* checkScope(this, target);
            def(this, propertyKey, {
                get() {
                    return (this[scopeKey] as ScopeData).$vm[propertyKey];
                },
                enumerable: false,
                configurable: true
            }); */
            return (this[scopeKey] as ScopeData).$vm[propertyKey];
        },
        enumerable: false,
        configurable: true
    };
}

export function checkScope(ctx: any, target: any) {
    if (!ScopeData.get(ctx)) {
        initScope(ctx, target);
    }
}

export function initScope(ctx: any, target: any) {
    const meta = ClassMetaData.get(target);
    const vm: Vue = new Vue({
        computed: bindGetters(meta.getterMeta, meta.getterKeys, ctx)
    });

    const option: IVubxOption = {
        plugins: [],
        createdHook: meta.hookMeta
    };
    const scope = new ScopeData(option);
    hideProperty(ctx, scopeKey, scope);
    scope.$vm = vm;
    proxyState(ctx, meta.getterKeys);
    proxyGetters(ctx, meta.getterKeys);
}
