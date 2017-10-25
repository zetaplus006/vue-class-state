import { IService, GlobalHelper } from './service';
import { Middleware } from './middleware';
import { IIdentifier } from './helper';

export interface IMutation {
    type: string;
    payload: any;
    methodName: string;
    identifier: IIdentifier;
}

export function mutation(target: any, mutationyKey: string, descriptor: PropertyDescriptor) {
    const mutationFn = descriptor.value;
    descriptor.value = function (this: IService, ...arg: any[]) {
        const vubxMutation: IMutation = {
            type: this.__scope__.identifier.toString() + ': ' + mutationyKey,
            payload: arg,
            methodName: mutationyKey,
            identifier: this.__scope__.identifier
        };

        const root = this.__scope__.$root;
        const globalMiddleware = root.__scope__.globalMiddlewate;
        const middleware = this.__scope__.middleware;

        const temp = this.__scope__.isCommitting;
        this.__scope__.isCommitting = true;
        let result;

        globalMiddleware.dispatchBefore(this, vubxMutation, this);
        middleware.dispatchBefore(this, vubxMutation, this);
        result = mutationFn.apply(this, arg);
        middleware.dispatchAfter(this, vubxMutation, this);
        globalMiddleware.dispatchAfter(this, vubxMutation, this);
        // arguments is different
        // res =  middleware.createTask(mutationFn, this)(...arg);

        this.__scope__.isCommitting = temp;
        return result;
    };
    return descriptor;
}