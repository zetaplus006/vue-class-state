import Vue from 'vue';
import { enumerable } from '../decorator';
import { assert } from '../util';

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

    protected replaceState<T extends Service>(state: T): void {

    }

}


const vmMethod = ['$watch', '$on', '$once', '$emit', '$off', '$set', '$delete'];

export interface ICreateOption {
    strict?: Boolean
}


export const commitKey = '__isCommitting';
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
        return class VuesClass extends constructor {

            get [commitKey]() {
                return __isCommitting;
            }
            set [commitKey](val: any) {
                __isCommitting = val;
            }

            constructor(...arg: any[]) {
                super();
                const getters = getPropertyGetters(constructor.prototype);
                // get hook
                const { beforeCreate, created } = constructor.prototype;
                const vm: Vue = new _Vue({
                    data: this,
                    computed: getters,
                    beforeCreate,
                    created
                });
                // computed proxy
                for (const key in getters) {
                    Object.defineProperty(this, key, {
                        get: () => vm[key],
                        set: value => vm[key] = value,
                        enumerable: true
                    });
                }
                // method proxy
                for (const key of vmMethod) {
                    Object.defineProperty(this, key, {
                        get: () => vm[key].bind(vm)
                    });
                }
                if (option && option.strict) {
                    openStrict(vm, this);
                }
            }
        }
    }
}

function openStrict(vm: Vue, service: any) {
    vm.$watch<any>(function () {
        return this.$data;
    }, (val) => {
        if (process.env.NODE_ENV !== 'production') {
            assert(service.__isCommitting, 'Do not mutate vubx service data outside mutation handlers.')
        }
    }, { deep: true, sync: true })
}



function getPropertyGetters(target: Function): { [key: string]: { get(): any, set?(): void } } {
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
};






