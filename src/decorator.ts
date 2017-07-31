import { createDecorator, Service } from './service/observable';
import { isFn, isPromise } from './util';
import { Middleware } from './service/middleware';
import Vue from 'vue';

export function action(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const val = descriptor.value;
    descriptor.value = function () {
        const res = val.apply(this, arguments);
        if (isPromise(res)) {
            /* return res.then((res: any) => {
                console.log('promise return ');
                return res;
            }); */
        } else {
            return res;
        }
    };
    return descriptor;
}

// for vuex devtool
interface IMutation {
    type: string;
    payload: any;
}

export function mutation(target: any, mutationyKey: string, descriptor: PropertyDescriptor) {
    const mutationFn = descriptor.value;
    descriptor.value = function (this: Service, ...arg: any[]) {
        const middleware = this.__.middleware,
            vubxMutation: IMutation = {
                type: this.__.identifier + ': ' + mutationyKey,
                payload: arg
            };
        const root = this.__.$root || this as Service;

        const temp = root.__.isCommitting;
        root.__.isCommitting = true;
        middleware.dispatchBefore(this, vubxMutation, this);
        const res = mutationFn.apply(this, arg);
        middleware.dispatchAfter(this, vubxMutation, this);

        // arguments is different
        // res = isSkip ? mutationFn.apply(this, arg)
        //     : middleware.createTask(mutationFn, this)(...arg);

        root.__.isCommitting = temp;
        return res;
    };
    return descriptor;
}

export function enumerable(value: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.enumerable = value;
    };
}

export {
    createDecorator
};