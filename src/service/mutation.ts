import { IService, GlobalHelper } from './service';
import { Middleware } from './middleware';
import { IIdentifier } from './helper';
import { DIMetaData } from '../di/di_meta';

export interface IMutation {
    type: string;
    payload: any;
    methodName: string;
    identifier: IIdentifier;
}

export function mutation(target: any, mutationyKey: string, descriptor: PropertyDescriptor) {
    const mutationFn = descriptor.value;
    descriptor.value = function (this: IService, ...arg: any[]) {
        const rootScope = this.__scope__.$root.__scope__,
            scope = this.__scope__,
            mete = DIMetaData.get(this);

        const vubxMutation: IMutation = {
            type: mete.identifier.toString() + ': ' + mutationyKey,
            payload: arg,
            methodName: mutationyKey,
            identifier: scope.identifier
        };

        const globalMiddleware = rootScope.globalMiddlewate;
        const middleware = scope.middleware;

        const temp = scope.isCommitting;
        scope.isCommitting = true;

        globalMiddleware.dispatchBefore(this, vubxMutation, this);
        middleware.dispatchBefore(this, vubxMutation, this);
        const result = mutationFn.apply(this, arg);
        middleware.dispatchAfter(this, vubxMutation, this);
        globalMiddleware.dispatchAfter(this, vubxMutation, this);
        // arguments is different
        // res =  middleware.createTask(mutationFn, this)(...arg);

        scope.isCommitting = temp;
        return result;
    };
    return descriptor;
}