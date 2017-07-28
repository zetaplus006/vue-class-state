import Vue from 'vue';
import { enumerable, mutation } from '../decorator';
import { assert } from '../util';
import { Middleware } from './middleware';

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

    @mutation
    replaceState(state: any): void {
        Object.assign(this, state);
    }

}

const def = Object.defineProperty;
export const commitKey = '__isCommitting';
export const middlewareKey = '__middleware';
export interface ICreateOption {
    strict?: Boolean;
}
/**
 * createObserveDecorator
 * @param _Vue
 */
export function createObserveDecorator(_Vue: typeof Vue, option?: ICreateOption) {
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
                const { beforeCreate, created } = constructor.prototype;
                const getterKeys = Object.keys(getters);
                const vm: Vue = new _Vue({
                    data: this,
                    computed: getters,
                    beforeCreate,
                    created
                });
                proxyGetters(this, vm, getterKeys);
                proxyState(this, getterKeys);
                proxyMethod(this, vm);

                // mutaion middleware
                def(this, middlewareKey, {
                    get: () => __middleware,
                    enumerable: false
                });
                if (option && option.strict) {
                    openStrict(vm, this);
                }
                def(this, commitKey, {
                    get: () => __isCommitting,
                    set: (val: boolean) =>
                        __isCommitting = val,
                    enumerable: false
                });
            }
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
    def(ctx, '$getters', {
        get: () => $getters,
        enumerable: false
    });
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
    def(ctx, '$state', {
        get: () => $state,
        enumerable: false
    });
}

const vmMethod = ['$watch', '$on', '$once', '$emit', '$off', '$set', '$delete'];

function proxyMethod(ctx: any, vm: Vue) {
    for (const key of vmMethod) {
        def(ctx, key, {
            get: () => vm[key].bind(vm)
        });
    }
}

function openStrict(vm: Vue, service: any) {
    if (process.env.NODE_ENV !== 'production') {
        vm.$watch<any>(function () {
            return this.$data;
        }, (val) => {
            assert(service[commitKey], 'Do not mutate vubx service data outside mutation handlers.');
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