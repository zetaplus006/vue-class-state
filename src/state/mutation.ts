import { DIMetaData } from '../di/di_meta';
import { IIdentifier } from './helper';
import { globalMiddleware } from './middleware';
import { ScopeData, scopeKey } from './scope';

export interface IMutation {
    type: string;
    payload: any[];
    mutationType: string;
    identifier: IIdentifier;
}

export function commit(state: any, fn: () => void, mutationType?: string): any {
    return runInMutaion(state, fn, null, mutationType);
}

export const mutationDecorator = (_target: any, methodName: string, descriptor: PropertyDescriptor) => {
    const mutationFn = descriptor.value;
    descriptor.value = function (this: any, ...arg: any[]) {
        return runInMutaion(this, mutationFn, arg, methodName);
    };
    return descriptor;
};

export const Mutation = Object.assign(mutationDecorator, { commit });

const unnamedName = '<unnamed mutation>';
const unknownIdentifier = 'unknown';
export function runInMutaion(
    ctx: any,
    func: () => void,
    payload: any,
    mutationType?: string) {
    const scope = ctx[scopeKey] as ScopeData,
        meta = DIMetaData.get(ctx),
        mType = mutationType || unnamedName,
        type = String(meta.identifier || unknownIdentifier) + ': ' + mType;

    const mutation: IMutation = {
        type,
        payload,
        mutationType: mType,
        identifier: meta.identifier
    };

    const middleware = scope.middleware;

    const temp = scope.isCommitting;
    scope.isCommitting = true;

    globalMiddleware.dispatchBefore(ctx, mutation, ctx);
    middleware.dispatchBefore(ctx, mutation, ctx);
    const result = func.apply(ctx, payload);
    middleware.dispatchAfter(ctx, mutation, ctx);
    globalMiddleware.dispatchAfter(ctx, mutation, ctx);
    // arguments is different
    // res =  middleware.createTask(mutationFn, this)(...payload);

    scope.isCommitting = temp;
    return result;
}
