import Vue from 'vue';
import { assert, def } from '../util';
import { Middleware, ISubscribeOption } from './middleware';
import { Provider } from '../di/provider';
import { devtool } from '../plugins/devtool';
import { ValueInjector, IInjector } from '../di/injector';
import { IConstructor, IPlugin, IIdentifier, appendServiceChild, proxyState, getPropertyGetters, proxyMethod, proxyGetters } from './helper';
import { IService, IVubxHelper } from './service';

export type IDecoratorOption = {
    identifier?: IIdentifier;
    root?: boolean;
    providers?: IInjector<IService>[];
    // injectors?: IInjector<IService>[];
    plugins?: IPlugin[];
}
export type IVubxDecorator = (option?: IDecoratorOption) => (constructor: IConstructor) => any;

/**
 * createObserveDecorator
 * @param _Vue
 */
export function createDecorator(_Vue: typeof Vue): IVubxDecorator {
    return function decorator(option?: IDecoratorOption) {
        return function (constructor: IConstructor) {
            return class Vubx extends constructor {
                constructor(...arg: any[]) {
                    super(...arg);
                    def(this, '__', { enumerable: false });
                    const getters = getPropertyGetters(constructor.prototype, this),
                        { created } = constructor.prototype,
                        getterKeys = Object.keys(getters);
                    const vm: Vue = new _Vue({
                        data: this,
                        computed: getters
                    });

                    proxyState(this, getterKeys);
                    proxyGetters(this, vm, getterKeys);
                    proxyMethod(this, vm);

                    let __ = this['__'] as IVubxHelper;
                    __.$vm = vm;
                    vm.$service = this as any;
                    if (option) {
                        const { root, identifier, providers = [], plugins = [] } = option;
                        if (root) {
                            __.$root = this as any;
                            __.provider = new Provider();
                            providers.forEach(injector => {
                                (__.provider as Provider).register(injector);
                            });
                            if (identifier) {
                                __.identifier = identifier;
                                // __.provider.push(identifier, this as any);
                                __.provider.register(new ValueInjector(identifier, this as any));
                            }
                        }
                        initPlugins(this, plugins);
                    }

                    created && created.call(this);
                }
            };
        };
    };
}

function initPlugins(ctx: any, plugin: IPlugin[]) {
    plugin.forEach(action => action(ctx as IService));
}