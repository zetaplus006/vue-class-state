import { IService, GlobalHelper } from './service';
import { Middleware } from './middleware';

export interface IMutation {
    type: string;
    payload: any;
}

export function mutation(target: any, mutationyKey: string, descriptor: PropertyDescriptor) {
    const mutationFn = descriptor.value;
    descriptor.value = function (this: IService, ...arg: any[]) {
        const vubxMutation: IMutation = {
            type: this.__.identifier.toString() + ': ' + mutationyKey,
            payload: arg
        };

        const root = this.__.$root;
        const globalMiddleware = root.__.globalMiddlewate;
        const middleware = this.__.middleware;

        const temp = root.__.isCommitting;
        root.__.isCommitting = true;
        let result;

        globalMiddleware.dispatchBefore(this, vubxMutation, this);
        middleware.dispatchBefore(this, vubxMutation, this);
        result = mutationFn.apply(this, arg);
        middleware.dispatchAfter(this, vubxMutation, this);
        globalMiddleware.dispatchAfter(this, vubxMutation, this);
        // arguments is different
        // res =  middleware.createTask(mutationFn, this)(...arg);

        root.__.isCommitting = temp;
        return result;
    };
    return descriptor;
}