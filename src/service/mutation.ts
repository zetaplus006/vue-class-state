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
        const hasRoot = !!this.__.$root;
        const root = (hasRoot ? this.__.$root : this) as IService;
        const globalMiddleware = hasRoot ? (root.__.global as GlobalHelper).middleware : null;
        const middleware = this.__.middleware;

        const temp = root.__.isCommitting;
        root.__.isCommitting = true;
        let result;
        try {
            globalMiddleware && globalMiddleware.dispatchBefore(this, vubxMutation, this);
            !hasRoot && middleware.dispatchBefore(this, vubxMutation, this);
            result = mutationFn.apply(this, arg);
            !hasRoot && middleware.dispatchAfter(this, vubxMutation, this);
            globalMiddleware && globalMiddleware.dispatchAfter(this, vubxMutation, this);
            // arguments is different
            // res =  middleware.createTask(mutationFn, this)(...arg);
        } finally {
            root.__.isCommitting = temp;
        }
        return result;
    };
    return descriptor;
}