import Vue, { VueConstructor } from 'vue';
import { ClassMetaData, IGetters } from '../di/class_meta';
import { DIMetaData } from '../di/di_meta';
import { hideProperty } from '../util';
import {
    definedComputed, IConstructor, IPlugin, proxyGetters,
    proxyState, ScopeData
} from './helper';
import { ICreatedHook } from './hook';
import { IService } from './service';

export interface IDecoratorOption {
    plugins?: IPlugin[];
}

export interface IVubxOption {
    plugins: IPlugin[];
    createdHook: ICreatedHook;
}

export type IVubxDecorator = (option?: IDecoratorOption) => (constructor: IConstructor) => any;

export function createDecorator (vueConstructor: VueConstructor): IVubxDecorator {
    return function decorator (option: IDecoratorOption) {
        return function (constructor: IConstructor) {
            return createVubxClass(vueConstructor, constructor, option);
        };
    };
}

export function createVubxClass (
    vueConstructor: VueConstructor,
    constructor: IConstructor,
    decoratorOption?: IDecoratorOption) {

    const classMeta = ClassMetaData.setGetterMeta(constructor.prototype);
    definedComputed(constructor.prototype, classMeta.getterKeys);

    return class Vubx extends constructor {
        constructor (...arg: any[]) {
            super(...arg);
            const meta = ClassMetaData.get(constructor.prototype);

            const vm: Vue = new vueConstructor({
                data: this,
                computed: bindGetters(meta.getterMeta, meta.getterKeys, this)
            });

            const option: IVubxOption = {
                plugins: [],
                createdHook: meta.hookMeta,
                ...decoratorOption
            };
            const scope = new ScopeData(option);
            // def(this, '__scope__', { value: scope, enumerable: false });
            hideProperty(this, '__scope__', scope);
            scope.$vm = vm;
            proxyState(this, meta.getterKeys);
            proxyGetters(this, meta.getterKeys);
        }
    };
}

export function createdHook (service: IService, option: IVubxOption, diMeta: DIMetaData) {
    initPlugins(service, service.__scope__.globalPlugins.concat(option.plugins));
    const hook = option.createdHook;
    if (hook) {
        const deps = diMeta.provider.getAll(hook.deps);
        hook.method.apply(service, deps);
    }
}

function initPlugins (ctx: any, plugin: IPlugin[]) {
    plugin.forEach((action) => action(ctx as IService));
}

function bindGetters (getters: IGetters, keys: string[], ctx: object) {
    const returnGetters = {};
    keys.forEach((key) => {
        returnGetters[key] = {
            get: getters[key].get.bind(ctx)
        };
    });
    return returnGetters;
}
