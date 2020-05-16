import Vue from 'vue';
import { ClassMetaData } from '../di/class_meta';
import { IContainer } from '../di/container';
import { IProxyState, Provider } from '../di/provider';
import { IIdentifier } from '../state/helper';
import { ScopeData } from '../state/scope';
import { def } from '../util';

export const devtoolHook =
    typeof window !== 'undefined' &&
    window['__VUE_DEVTOOLS_GLOBAL_HOOK__'];
export function devtool(container: IContainer, identifiers: IIdentifier[]) {

    const provider = container._provider;

    if (!devtoolHook) return;

    const store: IStore = simulationStore(provider, identifiers);

    devtoolHook.emit('vuex:init', store);

    devtoolHook.on('vuex:travel-to-state', (targetState: any) => {
        provider.replaceAllState(targetState);
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
        _devtoolHook: devtoolHook,
        // tslint:disable-next-line:no-empty
        registerModule() { },
        // tslint:disable-next-line:no-empty
        unregisterModule() { },
        replaceState(targetState: IProxyState) {
            provider.replaceAllState(targetState);
        },
        _vm: new Vue({}),
        _mutations: {}
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
        tryReadGetters(instance);
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
function tryReadGetters(instance: any, proto?: any) {
    if (proto && proto === Object.prototype) {
        return;
    }
    const _proto = Object.getPrototypeOf(proto || instance);
    const getterKeys = ClassMetaData.get(_proto).getterKeys;
    let len = getterKeys.length;
    try {
        while (len--) {
            instance[getterKeys[len]];
        }
        // tslint:disable-next-line:no-empty
    } finally { }
    tryReadGetters(instance, _proto);
}
