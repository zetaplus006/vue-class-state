import { createObserveDecorator } from './service/observable';
import { isFn, isPromise } from './util';

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


export function mutation(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const val = descriptor.value;
    descriptor.value = function (...arg: any[]) {
        this['__isCommitting'] = true
        console.log(this['name'], this['__isCommitting']);
        const res = val.apply(this, arg);
        this['__isCommitting'] = false;
        console.log(this['name'], this['__isCommitting']);
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