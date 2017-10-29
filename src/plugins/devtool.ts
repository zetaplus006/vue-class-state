import { IService, GlobalHelper, Service } from '../service/service';
import { Provider } from '../di/provider';
import { def } from '../util';
import { IIdentifier, proxyGetters } from '../service/helper';

export function devtool(provider: Provider) {

    const devtoolHook =
        typeof window !== 'undefined' &&
        window['__VUE_DEVTOOLS_GLOBAL_HOOK__'];

    if (!devtoolHook) return;

    const store = simulationStore(provider);

    store._devtoolHook = devtoolHook;

    devtoolHook.emit('vuex:init', store);

    devtoolHook.on('vuex:travel-to-state', (targetState: any) => {
        provider.replaceAllState(targetState);
    });

    provider.rootService.__scope__.globalMiddlewate.subscribe({
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

function simulationStore(provider: Provider): IStore {
    const { state, getters } = getStateAndGetters(provider.proxy);
    const store = {
        state,
        getters,
        _devtoolHook: null
        // subscribe:
    };
    return store;
}

function getStateAndGetters(proxy: any) {
    const getters = {};
    const state = {};
    let keys: IIdentifier[] = Object.keys(proxy);
    if (Object.getOwnPropertySymbols) {
        keys = keys.concat(Object.getOwnPropertySymbols(proxy));
    }
    keys.forEach(key => {
        const instance = proxy[key];
        if (instance instanceof Service) {
            def(getters, key.toString(), {
                value: instance.__scope__.$getters,
                enumerable: true,
                configurable: true
            });
            def(state, key.toString(), {
                value: instance.__scope__.$state,
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