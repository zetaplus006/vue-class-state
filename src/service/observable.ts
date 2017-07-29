import Vue from 'vue';
import { enumerable, mutation } from '../decorator';
import { assert, warn } from '../util';
import { Middleware } from './middleware';

const def = Object.defineProperty;
const defGet = (obj: Object, key: string, val: any, isEnumerable: boolean = false) =>
    def(obj, key, { get: () => val, enumerable: isEnumerable });

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

    $getters: any;
    $state: any;
    $parent: Service;
    $childs: Service[] = [];
    $uuid: string | Symbol;

    /**
     * After initialization has been completed
     */
    protected created?(): void;

    @mutation
    replaceState(state: any): void {
        Object.assign(this, state);
    }

    appendChild<S extends Service>(child: S, childName: keyof this, uuid: string | Symbol): void {
        Service.appendChild(this, childName, child, uuid);
    }

    static appendChild<P extends Service, C extends Service>(parent: P, childName: keyof P, child: C, uuid: string | Symbol) {
        if (process.env.NODE_ENV !== 'production') {
            if (parent.$childs.indexOf(child) > -1) {
                warn('The parent service already has this child service' +
                    'and cannot be added repeatedly');
                return;
            }
            if (child.$parent === parent) {
                warn('Services cannot be mutually parent and child');
                return;
            }
        }
        parent.$childs.push(child);
        child.$parent = parent;
        defGet(parent, '$uuid', uuid);
        def(parent, childName, {
            enumerable: true,
            configurable: true,
            get: () => child
        });
    }

}

export const commitKey = '__isCommitting';
export const mutationMiddlewareKey = '__middleware';
export interface ICreateOption {
    strict?: Boolean;
}
/**
 * createObserveDecorator
 * @param _Vue
 */
export function createDecorator(_Vue: typeof Vue) {
    return function observable(option?: ICreateOption) {
        /**
         * rewirte class constructor to defined observe
         * @param constructor
         * @param _Vue
         */
        return function observe<T extends { new(...args: any[]): {} }>(constructor: T) {
            let __isCommitting: boolean = false;
            const __middleware: Middleware = new Middleware();
            return class VubxClass extends constructor {

                constructor(...arg: any[]) {
                    super();
                    const getters = getPropertyGetters(constructor.prototype);
                    // get hook
                    const { created } = constructor.prototype;
                    const getterKeys = Object.keys(getters);
                    const self = this;
                    const vm: Vue = new _Vue({
                        data: this,
                        computed: getters
                    });
                    defGet(this, '__$$vm', vm);
                    proxyGetters(this, vm, getterKeys);
                    proxyState(this, getterKeys);
                    proxyMethod(this, vm);

                    // mutaion middleware
                    defGet(this, mutationMiddlewareKey, __middleware);
                    if (option && option.strict) {
                        openStrict(vm, this);
                    }
                    def(this, commitKey, {
                        get: () => __isCommitting,
                        set: (val: boolean) =>
                            __isCommitting = val,
                        enumerable: false
                    });
                    created && created.call(this);
                }
            };
        };
    };
}

function proxyGetters(ctx: any, vm: Vue, getterKeys: string[]) {
    const $getters = {};
    getterKeys.forEach(key => {
        def(ctx, key, {
            get: () => vm[key],
            set: value => vm[key] = value,
            enumerable: true
        });
        $getters[key] = ctx[key];
    });
    defGet(ctx, '$getters', $getters);
}

function proxyState(ctx: any, getterKeys: string[]) {
    const $state = {};
    Object.keys(ctx).forEach(
        key => {
            if (getterKeys.indexOf(key) < 0) {
                $state[key] = ctx[key];
            }
        }
    );
    defGet(ctx, '$state', $state);
}

const vmMethods = ['$watch', '$on', '$once', '$emit', '$off', '$set', '$delete'];

function proxyMethod(ctx: any, vm: Vue) {
    for (const key of vmMethods) {
        def(ctx, key, {
            get: () => vm[key].bind(vm)
        });
    }
}

function openStrict(vm: Vue, service: any) {
    if (process.env.NODE_ENV !== 'production') {
        vm.$watch<any>(function() {
            return this.$data;
        }, (val) => {
            assert(service[commitKey],
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