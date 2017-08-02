import Vue from 'vue';
import { enumerable, mutation, action } from '../decorator';
import { assert, warn, def } from '../util';
import { Middleware } from './middleware';
import { IVubxHelper, IVubxDecorator, IDecoratorOption, IConstructor, IInjector, IIentifier } from '../interfaces';
import { Provider } from './provider';

export abstract class Service {

    /**
     * $watch return a function that can close this watcher
     */
    protected $watch: typeof Vue.prototype.$watch;
    protected $on: typeof Vue.prototype.$on;
    protected $once: typeof Vue.prototype.$once;
    protected $emit: typeof Vue.prototype.$emit;
    protected $off: typeof Vue.prototype.$off;
    protected $set: typeof Vue.prototype.$set;
    protected $delete: typeof Vue.prototype.$delete;
    protected $destroy: typeof Vue.prototype.$destroy;

    __: IVubxHelper = {
        $getters: {},
        $state: {},
        $root: null,
        $parent: [],
        $children: [],
        isCommitting: false,
        middleware: new Middleware(),
        provider: null
    };

    /**
     * After initialization has been completed
     */
    protected created?(): void;

    getProvider(): Provider {
        return (this.__.$root as Service).__.provider as Provider;
    }

    protected async dispatch(identifier: IIentifier, actionType: string, ...arg: any[]): Promise<any> {

    }

    protected commit(identifier: IIentifier, mutationType: string, ...arg: any[]): any {

    }

    @mutation
    replaceState(state: Service): void {
        const keys = Object.keys(state);
        for (const key in state) {
            if (!this[key]) continue;
            if (this[key] instanceof Service) {
                (this[key] as Service).replaceState(state[key]);
            } else {
                this[key] = state[key];
            }
        }
    }

    appendChild<S extends Service>(child: S, childName: keyof this, identifier?: IIentifier): void {
        Service.appendChild(this, childName, child, identifier);
    }

    static appendChild<P extends Service, C extends Service>
        (parent: P, childName: keyof P, child: C, identifier?: IIentifier) {
        parent.__.$children.push(child);
        child.__.$parent.push(parent);
        let root;
        if (parent.__.$root) {
            root = parent.__.$root;
        } else {
            root = parent.__.$root = parent;
        }
        setRoot(parent, root);
        def(parent, childName, {
            enumerable: true,
            get: () => child
        });
        parent.__.$getters[childName] = child.__.$getters;
        parent.__.$state[childName] = child.__.$state;
    }
}

/**
 * createObserveDecorator
 * @param _Vue
 */
export function createDecorator(_Vue: typeof Vue): IVubxDecorator {
    return function decorator(option?: IDecoratorOption) {
        /**
         * rewirte class constructor to defined observe
         */
        return function(constructor: IConstructor) {
            return class Vubx extends constructor {
                constructor(...arg: any[]) {
                    super(...arg);
                    // hiddenKey.forEach(key => def(this, key, { enumerable: false }));
                    def(this, '__', { enumerable: false });
                    const getters = getPropertyGetters(constructor.prototype),
                        { created } = constructor.prototype,
                        getterKeys = Object.keys(getters);
                    const vm: Vue = new _Vue({
                        data: this,
                        computed: getters
                    });

                    proxyState(this, getterKeys);
                    proxyGetters(this, vm, getterKeys);
                    proxyMethod(this, vm);

                    // this['__']['$root'] = this;
                    let __ = this['__'] as IVubxHelper;
                    if (option) {
                        if (option.strict) {
                            openStrict(vm, this);
                        }

                        if (option.root) {
                            __.$root = this as any;
                            __.provider = new Provider();
                            if (option.identifier) {
                                __.provider.push(option.identifier, this as any);
                            }
                        }
                        if (option.injector) {
                            injectChildren(this, option.injector);
                        }
                    }
                    created && created.call(this);
                }
            };
        };
    };
}

function injectChildren(ctx: any, injectors: IInjector[]) {
    injectors.forEach(injector => injector(ctx as Service));
}

function proxyState(ctx: any, getterKeys: string[]) {
    const $state = (ctx as Service).__.$state;
    Object.keys(ctx).forEach(
        key => {
            if (getterKeys.indexOf(key) < 0) {
                /*  if (ctx[key] instanceof Service) {
                     // $state[key] = (ctx[key] as Service).__.$state;
                 } else {
                 } */
                def($state, key, { get: () => ctx[key], enumerable: true });
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
            enumerable: true
        });
        def($getters, key, {
            get: () => ctx[key],
            set: value => ctx[key] = value,
            enumerable: true
        });
    });
}

const vmMethods = ['$watch', '$on', '$once', '$emit', '$off', '$set', '$delete'];

function proxyMethod(ctx: any, vm: Vue) {
    for (const key of vmMethods) {
        def(ctx, key, {
            get: () => vm[key].bind(vm),
            enumerable: false
        });
    }
}

function openStrict(vm: Vue, service: any) {
    if (process.env.NODE_ENV !== 'production') {
        vm.$watch<any>(function() {
            return this.$data;
        }, (val) => {
            assert((service as Service).__.isCommitting,
                'Do not mutate vubx service data outside mutation handlers.');
        }, { deep: true, sync: true });
    }
}

function getPropertyGetters(target: any): { [key: string]: { get(): any, set?(): void } } {
    const getters = {};
    const keys: string[] = Object.getOwnPropertyNames(target);
    keys.forEach(key => {
        if (key === 'constructor') { return; }
        const descriptor = Object.getOwnPropertyDescriptor(target, key);
        if (descriptor.get && descriptor.enumerable) {
            getters[key] = {
                get: descriptor.get,
                set: descriptor.set
            };
        }
    });
    return getters;
}

function setRoot(parent: Service, root: Service) {
    parent.__.$children.forEach(s => {
        s.__.$root = root;
        setRoot(s, root);
    });
}