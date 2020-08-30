import { DIMetaData, meta_key } from '../di/di_meta';
import { assign } from '../util';
import { compose, IMiddleware } from './compose';
import { globalState, IIdentifier } from './helper';
export interface IMutation {
    type: string;
    payload: any[];
    mutationType: string;
    identifier: IIdentifier;
}

export const Mutation = assign(createMutation(), { create: createMutation });

export function createMutation(...middleware: IMiddleware[]) {

    let cb: (...args: any[]) => any;
    let args: any[] = [];

    const commitFn = compose(middleware.concat(globalState.middlewares)
        .concat((_next: () => void, _mutation: IMutation, state: any) => {
            const result = allowChange(() => cb && cb.apply(state, args));
            return result;
        }));

    // const commit = (state: any, fn: () => void, mutationType?: string, arg?: any[]) => {
    //     cb = fn;
    //     args = arg || [];
    //     return commitFn(null as any, createMuationData(state, mutationType, arg), state);
    // };

    function commit(fn: () => any, mutationType?: string, arg?: any[]): any;
    function commit(state: any, fn: () => any, mutationType?: string, arg?: any[]): any;
    function commit(...commitArgs: any[]) {
        let state: any;
        let mutationType: string;
        if (typeof commitArgs[0] === 'function') {
            state = undefined;
            cb = commitArgs[0];
            mutationType = commitArgs[1];
            args = commitArgs[2] || [];
        } else {
            state = commitArgs[0];
            cb = commitArgs[1];
            mutationType = commitArgs[2];
            args = commitArgs[3] || [];
        }
        return commitFn(null as any, createMuationData(state, mutationType, args), state);
    }

    function decorator(_target: any, methodName: string, descriptor: PropertyDescriptor) {
        const mutationFn = descriptor.value;
        descriptor.value = function (...arg: any[]) {
            return commit(this, mutationFn, methodName, arg);
        };
        return descriptor;
    }

    return assign(decorator, { commit });
}

const unnamedName = '<unnamed mutation>';
const unknownIdentifier = 'unknown';

function createMuationData(ctx: any | undefined, mutationType: string | undefined, payload: any) {
    const meta = ctx && ctx[meta_key] as DIMetaData | undefined,
        identifier = meta && meta.identifier || unknownIdentifier,
        mType = mutationType || unnamedName,
        type = identifier + ': ' + mType;

    const mutation: IMutation = {
        type,
        payload,
        mutationType: mType,
        identifier
    };
    return mutation;
}

export const allowChange = process.env.NODE_ENV !== 'production'
    ? (cb: () => void) => {
        const temp = globalState.isCommitting;
        globalState.isCommitting = true;
        const result = cb();
        globalState.isCommitting = temp;
        return result;
    }
    : (cb: () => void) => cb();
