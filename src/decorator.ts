import { createDecorator, commitKey, mutationMiddlewareKey } from './service/observable';
import { isFn, isPromise } from './util';
import { Middleware } from './service/middleware';
import Vue from 'vue';

export function action(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const val = descriptor.value;
    descriptor.value = function() {
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
    descriptor.value = function(...arg: any[]) {
        const isNotSkip = mutationyKey !== 'replaceState';
        const middleware = this[mutationMiddlewareKey] as Middleware;
        const vubxMutation: IMutation = {
            type: mutationyKey,
            payload: arg
        };
        const temp = this[commitKey];
        this[commitKey] = true;
        let res;
        try {
            isNotSkip && middleware.dispatchBefore(this, vubxMutation, this);
            res = mutationFn.apply(this, arg);
            isNotSkip && middleware.dispatchAfter(this, vubxMutation, this);

            // arguments is different
            // res = isSkip ? mutationFn.apply(this, arg)
            //     : middleware.createTask(mutationFn, this)(...arg);

        } catch (e) {
            throw new Error(e);
        } finally {
            this[commitKey] = temp;
        }
        return res;
    };
    return descriptor;
}

export function enumerable(value: boolean) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.enumerable = value;
    };
}

export {
    createDecorator
};