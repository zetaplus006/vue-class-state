import { Service } from '../service/';
import { middlewareKey } from '../service/observable';
import { Middleware } from '../service/middleware';


export default function devtool(service: Service) {

    const devtoolHook =
        typeof window !== 'undefined' &&
        window['__VUE_DEVTOOLS_GLOBAL_HOOK__']

    if (!devtoolHook) return

    const store = simulationStore(service)

    store._devtoolHook = devtoolHook

    devtoolHook.emit('vuex:init', store)

    devtoolHook.on('vuex:travel-to-state', (targetState: any) => {
        service.replaceState(targetState)
    })

    service[middlewareKey].subscribe({
        after: (mutation: string, state: any) => {
            devtoolHook.emit('vuex:mutation', mutation, state)
        }
    })
}

interface Store {
    state: any;
    getters: any;
    _devtoolHook: any;
    // subscribe(fn: (mutation: string, state: any) => void): any
}

function simulationStore(service: Service): Store {
    const store = {
        state: service.$state,
        getters: service.$getters,
        _devtoolHook: null
        // subscribe:
    }
    return store;
}

