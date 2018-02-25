import Vue, { VueConstructor } from 'vue';
import { ClassMetaData, IGetters } from '../di/class_meta';
import { DIMetaData } from '../di/di_meta';
import { hideProperty } from '../util';
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
        return createVubxClass(vueConstructor, constructor as any);
    };
}

export function createVubxClass(
    vueConstructor: VueConstructor,
    constructor: IConstructor) {

    const classMeta = ClassMetaData.setGetterMeta(constructor.prototype);
    definedComputed(constructor.prototype, classMeta.getterKeys);

    return class Vubx extends constructor {
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

export function createdHook(service: any, option: IVubxOption, diMeta: DIMetaData) {
    initPlugins(service, ScopeData.get(service)!.globalPlugins.concat(option.plugins));
    const hook = option.createdHook;
    if (hook) {
        const deps = diMeta.provider.getAll(hook.deps);
        hook.method.apply(service, deps);
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
