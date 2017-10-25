import { IService, GlobalHelper } from '../service/service';
import { Provider } from '../di/provider';
import { def } from '../util';
import { IIdentifier } from '../service/helper';

/* export function devtool(service: IService) {

    const devtoolHook =
        typeof window !== 'undefined' &&
        window['__VUE_DEVTOOLS_GLOBAL_HOOK__'];

    if (!devtoolHook) return;

    const store = simulationStore(service);

    store._devtoolHook = devtoolHook;

    devtoolHook.emit('vuex:init', store);

    devtoolHook.on('vuex:travel-to-state', (targetState: any) => {
        service.replaceState(targetState);
    });

    service.__.globalMiddlewate.subscribe({
        after: (mutation: any, state: any) => {
            devtoolHook.emit('vuex:mutation', mutation, state);
        }
    });
} */

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
    // subscribe(fn: (mutation: string, state: any) => void): any
}

function simulationStore(provider: Provider): IStore {
    const store = {
        state: provider.proxy,
        getters: getGetters(provider.proxy),
        _devtoolHook: null
        // subscribe:
    };
    return store;
}

function getGetters(proxy: any) {
    const getters = {};
    let keys: IIdentifier[] = Object.keys(proxy);
    if (Object.getOwnPropertySymbols) {
        keys = keys.concat(Object.getOwnPropertySymbols(proxy));
    }
    keys.forEach(key => {
        def(getters, key.toString(), {
            value: (proxy[key] as IService).__scope__.$getters,
            enumerable: true,
            configurable: true
        });
    });
    return getters;
}