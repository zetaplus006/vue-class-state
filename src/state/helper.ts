
import { DIMetaData } from '../di/di_meta';
import { watcherKey } from '../state/computed';
import { assert, hideProperty } from '../util';
import { Middleware } from './middleware';
import { ScopeData, scopeKey } from './scope';
import { Watcher } from './watcher';

// export interface IConstructor { new(...args: any[]): any; }

export interface IClass<T= any> { new(...args: any[]): T; }

export type IIdentifier = string;

export type IPlugin = (state: any) => void;

export const globalState = {
    middleware: new Middleware(),
    isCommitting: false
};

export function useStrict(state: any) {
    const identifier = DIMetaData.get(state).identifier,
        scope = state[scopeKey] as ScopeData || undefined;
    if (process.env.NODE_ENV !== 'production' && scope) {
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
