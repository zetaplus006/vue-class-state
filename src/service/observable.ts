import Vue from 'vue';
import { assert, def } from '../util';
import { Middleware } from './middleware';
import { IVubxHelper, IVubxDecorator, IDecoratorOption, IConstructor, IPlugin, IIdentifier, IService, ISubscribeOption } from '../interfaces';
import { Provider } from '../di/provider';
import { devtool } from '../plugins/devtool';
import { ValueInjector, IInjector } from '../di/injector';

const defaultConfig = {
    enumerable: true,
    configurable: true
};

export abstract class Service implements IService {

    $watch: typeof Vue.prototype.$watch;
    $on: typeof Vue.prototype.$on;
    $once: typeof Vue.prototype.$once;
    $emit: typeof Vue.prototype.$emit;
    $off: typeof Vue.prototype.$off;
    $set: typeof Vue.prototype.$set;
    $delete: typeof Vue.prototype.$delete;
    $destroy: typeof Vue.prototype.$destroy;

    __: IVubxHelper = {
        $vm: null,
        $getters: {},
        $state: {},
        $root: null,
        $parent: [],
        $children: [],
        isCommitting: false,
        middleware: new Middleware(),
        provider: null,
        identifier: '__vubx__'
    };

    /**
     * After initialization has been completed
     */
    created?(): void;

    /* async dispatch(identifier: IIdentifier, actionType: string, ...arg: any[]): Promise<any> {
        return await this.getProvider().getInstance(identifier)[actionType](...arg);
    }

    commit(identifier: IIdentifier, mutationType: string, ...arg: any[]): any {
        return this.getProvider().getInstance(identifier)[mutationType](...arg);
    } */

    replaceState(state: IService): void {
        const temp = this.__.isCommitting;
        this.__.isCommitting = true;
        for (const key in state) {
            if (this[key] instanceof Service) {
                (this[key] as IService).replaceState(state[key]);
            } else {
                this[key] = state[key];
            }
        }
        this.__.isCommitting = temp;
    }

    appendChild(child: IService, key: keyof this, identifier: IIdentifier): void {
        this.getProvider().checkIdentifier(identifier);
        def(this, key, {
            enumerable: true,
            get: () => child
        });
        appendServiceChild(this, key, child, identifier);
        // this.__.$root && this.__.$root.getProvider().push(identifier, child);
        this.__.$root && this.__.$root.getProvider().register(new ValueInjector(identifier, child));
    }

    /*  removeChild(key: keyof this, identifier: IIdentifier): void {
         const provider = this.getProvider();
         const child = provider.getInstance(identifier);
         child.__.$parent.forEach(p => {
             delete p.__.$state[key];
             delete p.__.$getters[key];
             const index = p.__.$children.indexOf(child);
             p.__.$children.splice(index, 1);
         });
         this.getProvider().removeInstance(identifier);
         child.$destroy();
     } */

    getProvider(): Provider {
        if (process.env.NODE_ENV !== 'production') {
            assert(this.__.$root,
                'Make sure to have a root service, ' +
                'Please check the root options in the decorator configuration');
        }
        return (this.__.$root as IService).__.provider as Provider;
    }

    subscribe(option: ISubscribeOption) {
        this.__.middleware.subscribe(option);
    }

    useStrict(isStrict = true) {
        if (isStrict && process.env.NODE_ENV !== 'production') {
            this.__.$vm && this.__.$vm.$watch<any>(function () {
                return this.$data;
            }, (val) => {
                assert(this.__.isCommitting,
                    'Do not mutate vubx service data outside mutation handlers.');
            }, { deep: true, sync: true });
        }
        return this;
    }

    useDevtool(useDevtool = true) {
        useDevtool && devtool(this);
        return this;
    }

}

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

function proxyState(ctx: any, getterKeys: string[]) {
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

function proxyGetters(ctx: any, vm: Vue, getterKeys: string[]) {
    const $getters = (ctx as Service).__.$getters;
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

function proxyMethod(ctx: any, vm: Vue) {
    for (const key of vmMethods) {
        def(ctx, key, {
            get: () => vm[key].bind(vm),
            enumerable: false
        });
    }
}

function getPropertyGetters(target: any, ctx: any): { [key: string]: { get(): any, set?(): void } } {
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
