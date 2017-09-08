import Vue from 'vue';
import { Provider } from '../di/provider';
import { ValueInjector, IInjector } from '../di/injector';
import { IConstructor, IPlugin, IIdentifier, proxyState, getPropertyGetters, proxyMethod, proxyGetters } from './helper';
import { IService, IVubxHelper } from './service';
import { def, assert } from '../util';
import { Middleware } from './middleware';

export type IDecoratorOption = {
    identifier?: IIdentifier;
    root?: boolean;
    vueMethods?: boolean,
    providers?: IInjector<IService>[];
    plugins?: IPlugin[];
};

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

                    let __ = this['__'] as IVubxHelper;
                    __.$vm = vm;
                    vm.$service = this as any;
                    if (option) {
                        const { root, identifier, providers = [], plugins = [], vueMethods } = option;
                        __.identifier = identifier || '__vubx';
                        if (root) {
                            __.$root = this as any;
                            __.provider = new Provider();
                            __.global = {
                                middleware: new Middleware(),
                                plugins: []
                            }
                            providers.forEach(injector => {
                                (__.provider as Provider).register(injector);
                            });
                            assert(identifier, 'A root Service must has a identifier and please check your decorator option');
                            if (identifier) {
                                __.provider.register(new ValueInjector(identifier, this as any));
                            }
                        }
                        if (vueMethods) {
                            proxyMethod(this, vm);
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