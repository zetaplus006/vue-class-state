import { DIMetaData } from '../di/di_meta';
import { watcherKey } from '../state/computed';
import { globalState } from '../state/helper';
import { ScopeData, scopeKey } from '../state/scope';
import { Watcher } from '../state/watcher';
import { assert, hideProperty } from '../util';

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
