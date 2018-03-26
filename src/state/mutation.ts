import { DIMetaData, meta_key } from '../di/di_meta';
import { compose, IMiddleware } from './compose';
import { globalState, IIdentifier } from './helper';
export interface IMutation {
    type: string;
    payload: any[];
    mutationType: string;
    identifier: IIdentifier;
}

export const Mutation = Object.assign(createMutation(), { create: createMutation });

export function createMutation(...middleware: IMiddleware[]) {

    let cb: () => void;

    const commitFn = compose(middleware.concat(...globalState.middlewares)
        .concat((next: () => void, _mutation: IMutation, _state: any) => {
            allowChange(() => cb && cb());
            next();
        }));

    const commit = (state: any, fn: () => void, mutationType?: string) => {
        cb = fn;
        return commitFn(null as any, createMuationData(state, mutationType, null), state);
    };

    function decorator(_target: any, methodName: string, descriptor: PropertyDescriptor) {
        const mutationFn = descriptor.value;
        let args: any = [];
        const mutationMiddleware = (next: () => void, _mutation: IMutation, state: any) => {
            allowChange(() => mutationFn.apply(state, args));
            next();
        };
        const fn = compose(middleware.concat(...globalState.middlewares).concat(mutationMiddleware));
        descriptor.value = function (...arg: any[]) {
            args = arg;
            return fn(null as any, createMuationData(this, methodName, args), this);
        };
        return descriptor;
    }

    return Object.assign(decorator, { commit });
}

const unnamedName = '<unnamed mutation>';
const unknownIdentifier = 'unknown';

function createMuationData(ctx: any, mutationType: string | undefined, payload: any) {
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
    return mutation;
}

function allowChange(cb: () => void) {
    const temp = globalState.isCommitting;
    globalState.isCommitting = true;
    cb();
    globalState.isCommitting = temp;
}
