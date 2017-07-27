import Vue from 'vue';

export abstract class Service {
    /**
     * $watch  return a function that can close this watcher
     */
    protected $watch: typeof Vue.prototype.$watch;
    protected $on: typeof Vue.prototype.$on;
    protected $once: typeof Vue.prototype.$once;
    protected $emit: typeof Vue.prototype.$emit;
    protected $off: typeof Vue.prototype.$off;
    protected $set: typeof Vue.prototype.$set;
    protected $delete: typeof Vue.prototype.$delete;
    protected $destroy: typeof Vue.prototype.$destroy;

    protected replaceState() {

    }

}


const vmMethod = ['$watch', '$on', '$once', '$emit', '$off', '$set', '$delete'];

/**
 * createObserveDecorator
 * @param _Vue 
 */
export function createObserveDecorator(_Vue: typeof Vue) {
    /**
     * rewirte class constructor to defined observe
     * @param constructor  
     * @param _Vue 
     */
    return function observe<T extends { new(...args: any[]): {} }>(constructor: T) {
        return class VuesClass extends constructor {
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
                        set: value => vm[key] = value
                    });
                }
                // method proxy
                for (const key of vmMethod) {
                    Object.defineProperty(this, key, {
                        get: () => vm[key].bind(vm)
                    });
                }
            }
        }
    }
}


export function getPropertyGetters(target: Function): { [key: string]: { get(): any, set?(): void } } {
    const getters = {};
    const keys: string[] = Object.getOwnPropertyNames(target);
    console.log(keys);
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


export function enumerable(value: boolean) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.enumerable = value;
    };
}

export function action(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const val = descriptor.value;
    descriptor.value = function() {
        const res = val.apply(this, arguments);
        // console.log('----action-----', res && (res instanceof Promise), res);
        if (isPromise(res)) {
            return res.then((res: any) => {
                console.log('promise return ');
                return res;
            });
        } else {
            // console.log('not promise return ');
            return res;
        }
    };
    return descriptor;
}

function isPromise(obj: any) {
    return obj && (obj instanceof Promise);
}

console.log(process.env.NODE_ENV)