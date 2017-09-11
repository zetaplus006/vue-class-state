import Vue from 'vue';
import { Provider } from '../di/provider';
import { ValueInjector, IInjector } from '../di/injector';
import { IConstructor, IPlugin, IIdentifier, proxyState, getPropertyGetters, proxyMethod, proxyGetters, VubxHelper } from './helper';
import { IService, IVubxHelper } from './service';
import { def, assert } from '../util';
import { Middleware } from './middleware';

export type IDecoratorOption = {
    identifier?: IIdentifier;
    root?: boolean;
    vueMethods?: boolean,
    providers?: IInjector<IService>[];
    plugins?: IPlugin[];
    globalPlugin?: IPlugin[];
};

type IDefalutOption = {
    identifier: IIdentifier;
    root: boolean;
    vueMethods: boolean,
    providers: IInjector<IService>[];
    plugins: IPlugin[];
    globalPlugin: IPlugin[];
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

                    const getters = getPropertyGetters(constructor.prototype, this),
                        { created } = constructor.prototype,
                        getterKeys = Object.keys(getters);
                    const vm: Vue = new _Vue({
                        data: this,
                        computed: getters
                    });

                    const option: IDefalutOption = {
                        identifier: '__vubx__',
                        root: false,
                        vueMethods: false,
                        providers: [],
                        plugins: [],
                        globalPlugin: [],
                        ...decoratorOption
                    };
                    const helper = new VubxHelper(option.root, this as any, option.identifier);
                    def(this, '__', { value: helper, enumerable: false });
                    helper.$vm = vm;
                    vm.$service = this as any;
                    proxyState(this, getterKeys);
                    proxyGetters(this, vm, getterKeys);
                    if (option.vueMethods) {
                        proxyMethod(this, vm);
                    }
                    option.providers.forEach(injector => helper.provider.register(injector));
                    if (decoratorOption && decoratorOption.root) {
                        assert(decoratorOption.identifier,
                            'A root Service must has a identifier and please check your decorator option');
                        // helper.globalPlugins = option.globalPlugin; is not get this $root , Service static 
                        helper.provider.register(new ValueInjector(option.identifier, this as any));
                    }
                    initPlugins(this, option.plugins);
                    created && created.call(this);
                }
            };
        };
    };
}

function initPlugins(ctx: any, plugin: IPlugin[]) {
    plugin.forEach(action => action(ctx as IService));
}