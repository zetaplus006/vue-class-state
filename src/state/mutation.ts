import { DIMetaData, meta_key } from '../di/di_meta';
import { globalState, IIdentifier } from './helper';
import { Middleware } from './middleware';

export interface IMutation {
    type: string;
    payload: any[];
    mutationType: string;
    identifier: IIdentifier;
}

export interface IMutationOption {
    before?: (mutation: IMutation, state: any) => any;
    after?: (mutation: IMutation, state: any) => any;
}

const unnamedName = '<unnamed mutation>';
const unknownIdentifier = 'unknown';

export function MutationFactory(...options: IMutationOption[]): any;
export function MutationFactory(_target: any, methodName: string, descriptor: PropertyDescriptor): any;
export function MutationFactory(): any {
    if (arguments.length >= 3 && typeof arguments[1] === 'string') {
        rewriteMethod(arguments[2], arguments[1], undefined);
    } else {
        return createMutation.apply(null, arguments);
    }
}

export function createMutation() {
    let middleware: Middleware | undefined;
    if (arguments.length) {
        middleware = new Middleware();
        middleware.subscribe.apply(middleware, arguments);
    }
    const mutation = (_target: any, methodName: string, descriptor: PropertyDescriptor) => {
        return rewriteMethod(descriptor, methodName, middleware);
    };
    // tslint:disable-next-line:no-shadowed-variable
    const commit = (state: any, fn: () => void, mutationType?: string) => {
        return runInMutaion(state, fn, null, middleware, mutationType);
    };
    return Object.assign(mutation, { commit });
}

export function rewriteMethod(
    descriptor: PropertyDescriptor,
    methodName: string,
    middleware: Middleware | undefined): PropertyDescriptor {
    const mutationFn = descriptor.value;
    descriptor.value = function (...arg: any[]) {
        return runInMutaion(this, mutationFn, arg, middleware, methodName);
    };
    return descriptor;
}

export function runInMutaion(
    ctx: any,
    func: () => void,
    payload: any,
    middleware?: Middleware,
    mutationType?: string) {
    const meta = ctx[meta_key] as DIMetaData || undefined,
        identifier = meta && meta.identifier || unknownIdentifier,
        mType = mutationType || unnamedName,
        type = identifier + ': ' + mType;

    const mutation: IMutation = {
        type,
        payload,
        mutationType: mType,
        identifier
    };

    const temp = globalState.isCommitting;
    globalState.isCommitting = true;

    globalState.middleware.dispatchBefore(ctx, mutation, ctx);
    middleware && middleware.dispatchBefore(ctx, mutation, ctx);
    const result = func.apply(ctx, payload);
    middleware && middleware.dispatchAfter(ctx, mutation, ctx);
    globalState.middleware.dispatchAfter(ctx, mutation, ctx);
    // arguments is different
    // res =  middleware.createTask(mutationFn, this)(...payload);

    globalState.isCommitting = temp;
    return result;
}

export function commit(state: any, fn: () => void, mutationType?: string): any {
    return runInMutaion(state, fn, null, undefined, mutationType);
}

export const Mutation = Object.assign(MutationFactory, { commit });
