import { ClassMetaData } from '../di/class_meta';
import { IContainer } from '../di/container';
import { Provider } from '../di/provider';
import { IIdentifier } from '../state/helper';
import { globalMiddleware } from '../state/middleware';
import { ScopeData } from '../state/scope';
import { def } from '../util';

export function devtool(container: IContainer, identifiers: IIdentifier[]) {

    const provider = container._provider;

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

    globalMiddleware.subscribe({
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
        let scope = ScopeData.get(instance);
        if (scope === null) {
            tryReadGetter(instance);
            scope = ScopeData.get(instance);
        }
        def(getters, String(key), {
            value: scope!.$getters,
            enumerable: true,
            configurable: true
        });
        def(state, String(key), {
            value: scope!.$state,
            enumerable: true,
            configurable: true
        });
    });
    return {
        state,
        getters
    };
}

/**
 * try to read the first getter
 * @param instance
 */
function tryReadGetter(instance: any) {
    const classMeta = ClassMetaData.get(Object.getPrototypeOf(instance));
    if (classMeta.getterKeys.length) {
        try {
            instance[classMeta.getterKeys[0]];
            // tslint:disable-next-line:no-empty
        } finally { }
    }
}
