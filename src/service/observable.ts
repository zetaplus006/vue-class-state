import Vue from 'vue';
import { Provider } from '../di/provider';
import { ValueInjector, IInjector } from '../di/injector';
import { IConstructor, IPlugin, IIdentifier, proxyState, proxyMethod, proxyGetters, VubxHelper, getAllGetters, useStrict } from './helper';
import { IService } from './service';
import { def, assert } from '../util';
import { Middleware } from './middleware';
import { devtool } from '../plugins/devtool';
import { MetaData } from '../di/meta';

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
    created(): void;
};

export type IVubxDecorator = (option?: IDecoratorOption) => (constructor: IConstructor) => any;

/**
 * createObserveDecorator
 * @param _Vue
 */
export function createDecorator(_Vue: typeof Vue): IVubxDecorator {
    return function decorator(decoratorOption?: IDecoratorOption) {
        return function (constructor: IConstructor) {
            return class Vubx extends constructor {
                constructor(...arg: any[]) {
                    super(...arg);

                    const getters = getAllGetters(constructor.prototype, this),
                        { created } = constructor.prototype,
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
                        created,
                        ...decoratorOption
                    };
                    const helper = new VubxHelper(this as any, option);
                    def(this, '__', { value: helper, enumerable: false });
                    helper.$vm = vm;
                    vm.$service = this as any;
                    proxyState(this, getterKeys);
                    proxyGetters(this, vm, getterKeys);
                    // if (option.vueMethods) {
                    //     proxyMethod(this, vm);
                    // }

                    if (decoratorOption && decoratorOption.root) {
                        assert(decoratorOption.identifier,
                            'A root Service must has a identifier and please check your decorator option');
                        helper.provider.register(new ValueInjector(option.identifier, this as any));
                        option.providers.forEach(injector => helper.provider.register(injector));

                        helper.identifier = option.identifier;
                        helper.$root = this as any;
                        createdHook(this as any, option);
                        helper.hasBeenInjected = true;

                        if (option.devtool) {
                            devtool(helper.provider);
                        }
                    }
                    /**
                     * Children services execute createdHook in injector
                     */
                }
            };
        };
    };
}

export function createdHook(service: IService, option: IVubxOption) {
    initPlugins(service, service.__.globalPlugins.concat(option.plugins));
    option.created && option.created.call(service);
    const rootOption = service.__.$root.__.vubxOption;
    if (rootOption.strict) {
        useStrict(service);
    }
}

function initPlugins(ctx: any, plugin: IPlugin[]) {
    plugin.forEach(action => action(ctx as IService));
}
