import Vue from 'vue';
import { Provider } from '../di/provider';
import { ValueInjector, IInjector, BaseInjector } from '../di/injector';
import { IConstructor, IPlugin, IIdentifier, proxyState, proxyGetters, ScopeData, getAllGetters, useStrict } from './helper';
import { IService, Service } from './service';
import { def, assert } from '../util';
import { Middleware } from './middleware';
import { devtool } from '../plugins/devtool';
import { ClassMetaData } from '../di/class_meta';
import { DIMetaData } from '../di/di_meta';
import { ICreatedHook, created } from './hook';

export type IDecoratorOption = {
    identifier?: IIdentifier;
    root?: boolean;
    strict?: boolean;
    devtool?: boolean;
    providers?: IInjector<IService>[];
    plugins?: IPlugin[];
    globalPlugins?: IPlugin[];
};

export type IVubxOption = {
    identifier: IIdentifier;
    root: boolean;
    strict: boolean;
    devtool: boolean;
    providers: IInjector<IService>[];
    plugins: IPlugin[];
    globalPlugins: IPlugin[];
    createdHook: ICreatedHook;
};

export type IVubxDecorator = (option?: IDecoratorOption) => (constructor: IConstructor) => any;

/**
 * createObserveDecorator
 * @param _Vue
 */
export function createDecorator(_Vue: typeof Vue): IVubxDecorator {
    return function decorator(decoratorOption?: IDecoratorOption) {
        return function(constructor: IConstructor) {
            return class Vubx extends constructor {
                constructor(...arg: any[]) {
                    super(...arg);

                    const getters = getAllGetters(constructor.prototype, this),
                        getterKeys = Object.keys(getters);
                    const vm: Vue = new _Vue({
                        data: this,
                        computed: getters
                    });

                    const option: IVubxOption = {
                        identifier: '__vubx__',
                        root: false,
                        strict: false,
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
                    vm.$service = this as any;
                    proxyState(this, getterKeys);
                    proxyGetters(this, vm, getterKeys);

                    if (decoratorOption && decoratorOption.root) {
                        assert(decoratorOption.identifier,
                            'A root Service must has a identifier and please check your decorator option');
                        scope.$root = this as any;

                        const provider = new Provider(this as any);
                        provider.registerInjectedHook((instance: IService, diMeta: DIMetaData) => {
                            if (instance instanceof Service) {
                                instance.__scope__.$root = this as any;
                                createdHook(instance, instance.__scope__.vubxOption, diMeta);
                            }
                        });
                        provider.register(new ValueInjector(option.identifier, this as any));
                        option.providers.forEach(injector => provider.register(injector));

                        const meta = DIMetaData.get(this);
                        meta.identifier = option.identifier;
                        meta.provider = provider;
                        createdHook(this as any, option, meta);
                        meta.hasBeenInjected = true;

                        if (option.devtool) {
                            devtool(provider);
                        }
                    }
                }
            };
        };
    };
}

export function createdHook(service: IService, option: IVubxOption, diMeta: DIMetaData) {
    initPlugins(service, service.__scope__.globalPlugins.concat(option.plugins));
    // option.created && option.created.call(service);
    const hook = option.createdHook;
    if (hook) {
        const deps = diMeta.provider.getAll(hook.deps);
        hook.method.apply(service, deps);
    }
    const rootOption = service.__scope__.$root.__scope__.vubxOption;
    if (rootOption.strict) {
        useStrict(service);
    }
}

function initPlugins(ctx: any, plugin: IPlugin[]) {
    plugin.forEach(action => action(ctx as IService));
}
