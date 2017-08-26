import Vue from 'vue';
import { assert, def } from '../util';
import { Middleware } from './middleware';
import { IVubxHelper, IVubxDecorator, IDecoratorOption, IConstructor, IPlugin, IIdentifier, IService, ISubscribeOption } from '../interfaces';
import { Provider } from './provider';

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

    async dispatch(identifier: IIdentifier, actionType: string, ...arg: any[]): Promise<any> {
        return await this.getProvider().getInstance(identifier)[actionType](...arg);
    }

    commit(identifier: IIdentifier, mutationType: string, ...arg: any[]): any {
        return this.getProvider().getInstance(identifier)[mutationType](...arg);
    }

    replaceState(state: Service): void {
        const temp = this.__.isCommitting;
        this.__.isCommitting = true;
        for (const key in state) {
            if (this[key] instanceof Service) {
                (this[key] as Service).replaceState(state[key]);
            } else {
                this[key] = state[key];
            }
        }
        this.__.isCommitting = temp;
    }

    appendChild<S extends Service>(child: S, key: keyof this, identifier: IIdentifier): void {
        this.getProvider().checkIdentifier(identifier);
        def(this, key, {
            enumerable: true,
            get: () => child
        });
        appendServiceChild(this, key, child, identifier);
        this.__.$root && this.__.$root.getProvider().push(identifier, child);
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
        return (this.__.$root as Service).__.provider as Provider;
    }

    subscribe(option: ISubscribeOption) {
        this.__.middleware.subscribe(option);
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

                    let __ = this['__'] as IVubxHelper;
                    if (option) {
                        const { strict, root, identifier, provider = [], injector = [], plugins = [] } = option;
                        strict && openStrict(vm, this);
                        if (root) {
                            __.$root = this as any;
                            __.provider = new Provider();
                            if (identifier) {
                                __.identifier = identifier;
                                __.provider.push(identifier, this as any);
                            }
                        }
                        initPlugins(this, provider.concat(injector).concat(plugins));
                    }
                    created && created.call(this);
                }
            };
        };
    };
}

function initPlugins(ctx: any, plugin: IPlugin[]) {
    plugin.forEach(injector => injector(ctx as Service));
}

function proxyState(ctx: any, getterKeys: string[]) {
    const $state = (ctx as Service).__.$state;
    Object.keys(ctx).forEach(
        key => {
            if (getterKeys.indexOf(key) < 0) {
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

const vmMethods = ['$watch', '$on', '$once', '$emit', '$off', '$set', '$delete', '$destroy'];

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
        vm.$watch<any>(function () {
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
        if (descriptor.get) {
            getters[key] = {
                get: descriptor.get,
                set: descriptor.set
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
    // setRoot(parent, parent.__.$root as Service);
    child.__.$root = parent.__.$root;
    child.__.identifier = identifier;
    parent.__.$getters[childName] = child.__.$getters;
    parent.__.$state[childName] = child.__.$state;
}

function setRoot(parent: Service, root: Service) {
    parent.__.$children.forEach(s => {
        s.__.$root = root;
        setRoot(s, root);
    });
}
