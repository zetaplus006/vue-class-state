import { DIMetaData } from '../di/di_meta';
import { IIdentifier } from './helper';
import { IService } from './service';

export interface IMutation {
    type: string;
    payload: any[];
    mutationType: string;
    identifier: IIdentifier;
}

export function mutation (_target: any, methodName: string, descriptor: PropertyDescriptor) {
    const mutationFn = descriptor.value;
    descriptor.value = function (this: IService, ...arg: any[]) {
        return runInMutaion(this, mutationFn, arg, methodName);
    };
    return descriptor;
}

const unnamedName = '<unnamed mutation>';

export function runInMutaion (
    ctx: IService,
    func: () => void,
    payload: any,
    mutationType?: string) {
    const scope = ctx.__scope__,
        meta = DIMetaData.get(ctx),
        mType = mutationType || unnamedName;

    const vubxMutation: IMutation = {
        type: String(meta.identifier) + ': ' + mType,
        payload,
        mutationType: mType,
        identifier: meta.identifier
    };

    const globalMiddleware = scope.module && scope.globalMiddlewate;
    const middleware = scope.middleware;

    const temp = scope.isCommitting;
    scope.isCommitting = true;

    globalMiddleware && globalMiddleware.dispatchBefore(ctx, vubxMutation, ctx);
    middleware.dispatchBefore(ctx, vubxMutation, ctx);
    const result = func.apply(ctx, payload);
    middleware.dispatchAfter(ctx, vubxMutation, ctx);
    globalMiddleware && globalMiddleware.dispatchAfter(ctx, vubxMutation, ctx);
    // arguments is different
    // res =  middleware.createTask(mutationFn, this)(...payload);

    scope.isCommitting = temp;
    return result;
}
