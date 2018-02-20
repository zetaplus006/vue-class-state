import { IService, Service } from '../service/service';
import { Provider } from '../di/provider';
import { def } from '../util';
import { IIdentifier, proxyGetters } from '../service/helper';
import { DIMetaData } from '../di/di_meta';
import { StateModule } from '../module/module';

export function devtool(module: StateModule, identifiers: IIdentifier[]) {

    const provider = module['_provider'];

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

    module['_globalMiddleware'].subscribe({
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
    let keys: IIdentifier[] = identifiers;
    keys.forEach(key => {
        const instance = proxy[key];
        if (instance instanceof Service) {
            def(getters, String(key), {
                value: instance.__scope__.$getters,
                enumerable: true,
                configurable: true
            });
            def(state, String(key), {
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