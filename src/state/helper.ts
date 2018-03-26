
import { devtoolHook } from '../dev/devtool';
import { DIMetaData } from '../di/di_meta';
import { watcherKey } from '../state/computed';
import { assert, hideProperty } from '../util';
import { IMiddleware } from './compose';
import { ScopeData, scopeKey } from './scope';
import { Watcher } from './watcher';

export interface IClass<T= any> { new(...args: any[]): T; }

export type IIdentifier = string;

export type IPlugin = (state: any) => void;

export const globalState = {
    middlewares: [] as IMiddleware[],
    isCommitting: false
};

if (process.env.NODE_ENV !== 'production' && devtoolHook) {
    globalState.middlewares.push((next: any, mutation: any, state: any) => {
        next();
        devtoolHook.emit('vuex:mutation', mutation, state);
    });
}

export function useStrict(state: any) {
    const identifier = DIMetaData.get(state).identifier,
        scope = state[scopeKey] as ScopeData || undefined;
    if (scope) {
        if (!state[watcherKey]) {
            hideProperty(state, watcherKey, []);
        }
        new Watcher(state, () => {
            return scope.$state;
        }, () => {
            assert(globalState.isCommitting,
                `Do not mutate state[${identifier}] data outside mutation handlers.`);
        }, { deep: true, sync: true } as any
        );
    }
}
