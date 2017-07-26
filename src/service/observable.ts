import Vue from 'vue';
import __Vue from 'vue4vues';



export default class Obsverable {

    private vm: Vue;

    constructor(_Vue: typeof Vue) {

    }

    protected initObsverable(storeConstructor: Function) {
        const getters = getPropertyGetters(storeConstructor.prototype);

        if (!this.vm) {
            this.vm = new Vue({
                data: this,
                computed: getters
            });
        }
        for (const key in getters) {
            Object.defineProperty(this, key, {
                get: () => this.vm[key],
                set: value => this.vm[key] = value
            });
        }
    }


    protected replaceState() {
        console.log(Object.keys(this));
    }

    protected get $watch() {
        return this.vm.$watch.bind(this.vm);
    }
    protected get $on() {
        return this.vm.$on.bind(this.vm);
    }
    protected get $once() {
        return this.vm.$once.bind(this.vm);
    }
    protected get $emit() {
        return this.vm.$emit.bind(this.vm);
    }
    protected get $off() {
        return this.vm.$off.bind(this.vm);
    }
    protected get $set() {
        return this.vm.$set.bind(this.vm);
    }
    protected get $delete() {
        return this.vm.$delete.bind(this.vm);
    }

}

// def class observable

/**
 * rewirte class constructor to defined observe
 * @param constructor  
 * @param _Vue 
 */
export function observe<T extends { new(...args: any[]): {} }>(constructor: T) {
    return class VuesClass extends constructor {
        constructor(...arg: any[]) {
            super();
            const getters = getPropertyGetters(constructor.prototype);
            const vm: Vue = new __Vue({
                data: this,
                computed: getters
            });
            // computed proxy
            for (const key in getters) {
                Object.defineProperty(this, key, {
                    get: () => vm[key],
                    set: value => vm[key] = value
                });
            }
        }
    }
}


export function getPropertyGetters(target: Function): { [key: string]: { get(): any, set?(): void } } {
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


export function enumerable(value: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.enumerable = value;
    };
}

export function action(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const val = descriptor.value;
    descriptor.value = function () {
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

