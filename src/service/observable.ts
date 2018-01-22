import Vue, { VueConstructor } from 'vue';
import { Provider } from '../di/provider';
import { ValueInjector, IInjector, BaseInjector } from '../di/injector';
import { IConstructor, IPlugin, IIdentifier, proxyState, proxyGetters, ScopeData, getAllGetters, useStrict, definedComputed } from './helper';
import { IService, Service } from './service';
import { def, assert, hasSymbol } from '../util';
import { Middleware } from './middleware';
import { devtool } from '../plugins/devtool';
import { ClassMetaData, IGetters } from '../di/class_meta';
import { DIMetaData } from '../di/di_meta';
import { ICreatedHook, created } from './hook';
import { Binding } from '../di/binding';

export type IDecoratorOption = {
    identifier?: IIdentifier;
    root?: boolean;
    strict?: boolean;
    devtool?: boolean;
    providers?: Binding<any>[];
    plugins?: IPlugin[];
    globalPlugins?: IPlugin[];
};

export type IVubxOption = {
    identifier: IIdentifier;
    root: boolean;
    strict?: boolean;
    devtool: boolean;
    providers: Binding<any>[];
    plugins: IPlugin[];
    globalPlugins: IPlugin[];
    createdHook: ICreatedHook;
};

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
                identifier: '__vubx__',
                root: false,
                devtool: false,
                providers: [],
                plugins: [],
                globalPlugins: [],
                createdHook: ClassMetaData.get(constructor.prototype).hookMeta,
                ...decoratorOption
            };
            const scope = new ScopeData(this as any, option);
            def(this, '__scope__', { value: scope, enumerable: false });
            scope.$vm = vm;
            proxyState(this, meta.getterKeys);
            proxyGetters(this, vm, meta.getterKeys);

            if (decoratorOption && decoratorOption.root) {
                assert(decoratorOption.identifier,
                    'A root Service must has a identifier and please check your decorator option');
                scope.$root = this as any;

                const provider = new Provider();
                provider.registerInjectedHook((instance: IService, diMetaData: DIMetaData) => {
                    if (instance instanceof Service) {
                        instance.__scope__.$root = this as any;
                        createdHook(instance, instance.__scope__.vubxOption, diMetaData);
                    }
                });
                provider.register(new ValueInjector(option.identifier, true, this as any));
                option.providers.forEach(binding => provider.register(binding.injectorFactory()));

                const diMeta = DIMetaData.get(this);
                diMeta.identifier = option.identifier;
                diMeta.provider = provider;
                createdHook(this as any, option, diMeta);
                diMeta.hasBeenInjected = true;

                if (option.devtool) {
                    devtool(this as any);
                }
            }
        }
    };
}

export function createdHook (service: IService, option: IVubxOption, diMeta: DIMetaData) {
    initPlugins(service, service.__scope__.globalPlugins.concat(option.plugins));
    const rootOption = service.__scope__.$root.__scope__.vubxOption;
    const strict = option.hasOwnProperty('strict') ? option.strict : rootOption.strict;
    if (strict) {
        useStrict(service);
    }
    const hook = option.createdHook;
    if (hook) {
        const deps = diMeta.provider.getAll(hook.deps);
        hook.method.apply(service, deps);
    }
}

function initPlugins (ctx: any, plugin: IPlugin[]) {
    plugin.forEach(action => action(ctx as IService));
}

function bindGetters (getters: IGetters, keys: string[], ctx: Object) {
    const returnGetters = {};
    keys.forEach(key => {
        returnGetters[key] = {
            get: getters[key].get.bind(ctx)
        };
    });
    return returnGetters;
}