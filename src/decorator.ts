import { createObserveDecorator, commitKey, middlewareKey } from './service/observable';
import { isFn, isPromise } from './util';
import { Middleware } from './service/middleware';

export function action(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const val = descriptor.value;
    descriptor.value = function () {
        const res = val.apply(this, arguments);
        if (isPromise(res)) {
            return res.then((res: any) => {
                console.log('promise return ');
                return res;
            });
        } else {
            return res;
        }
    };
    return descriptor;
}

type Mutation = {
    type: string,
    payload: any
}

export function mutation(target: any, mutationyKey: string, descriptor: PropertyDescriptor) {
    const mutationFn = descriptor.value;
    descriptor.value = function (...arg: any[]) {
        const isSkip = mutationyKey === 'replaceState';
        const middleware = this[middlewareKey] as Middleware;
        const vubxMutation: Mutation = {
            type: mutationyKey,
            payload: arg
        }
        const temp = this[commitKey];
        this[commitKey] = true
        let res;
        try {
            !isSkip && middleware && middleware.dispatchBefore(vubxMutation, this);
            res = mutationFn.apply(this, arg);
            !isSkip && middleware && middleware.dispatchAfter(vubxMutation, this);
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
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.enumerable = value;
    };
}

export {
    createObserveDecorator
}