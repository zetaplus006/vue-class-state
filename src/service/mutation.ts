import { DIMetaData } from '../di/di_meta';
import { IIdentifier } from './helper';

export interface IMutation {
    type: string;
    payload: any[];
    mutationType: string;
    identifier: IIdentifier;
}

export function Mutation (_target: any, methodName: string, descriptor: PropertyDescriptor) {
    const mutationFn = descriptor.value;
    descriptor.value = function (this: any, ...arg: any[]) {
        return runInMutaion(this, mutationFn, arg, methodName);
    };
    return descriptor;
}

export function commit (state: any, fn: () => void, mutationType?: string): any {
    return runInMutaion(state, fn, null, mutationType);
}

const unnamedName = '<unnamed mutation>';

export function runInMutaion (
    ctx: any,
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
