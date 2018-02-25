import { Provider } from '../di/provider';
import { IStateModule } from '../module/module';
import { IIdentifier } from '../service/helper';
import { ScopeData } from '../service/scope';
import { def } from '../util';

export function devtool(module: IStateModule, identifiers: IIdentifier[]) {

    const provider = module._provider;

    const devtoolHook =
        typeof window !== 'undefined' &&
        window['__VUE_DEVTOOLS_GLOBAL_HOOK__'];

    if (!devtoolHook) return;

    const store: IStore = simulationStore(provider, identifiers);

    store._devtoolHook = devtoolHook;

    devtoolHook.emit('vuex:init', store);

    devtoolHook.on('vuex:travel-to-state', (targetState: any) => {
        provider.replaceAllState(targetState);
    });

    module._globalMiddleware.subscribe({
        after: (mutation: any, state: any) => {
            devtoolHook.emit('vuex:mutation', mutation, state);
        }
    });
}

interface IStore {
    state: any;
    getters: any;
    _devtoolHook: any;
}

function simulationStore(provider: Provider, identifiers: IIdentifier[]): IStore {
    const { state, getters } = getStateAndGetters(provider.proxy, identifiers);
    const store = {
        state,
        getters,
        _devtoolHook: null
    };
    return store;
}

function getStateAndGetters(proxy: any, identifiers: IIdentifier[]) {
    const getters = {};
    const state = {};
    const keys: IIdentifier[] = identifiers;
    keys.forEach((key) => {
        const instance = proxy[key];
        const scope = ScopeData.get(instance);
        if (scope) {
            def(getters, String(key), {
                value: scope.$getters,
                enumerable: true,
                configurable: true
            });
            def(state, String(key), {
                value: scope.$state,
                enumerable: true,
                configurable: true
            });
        }
    });
    return {
        state,
        getters
    };
}
