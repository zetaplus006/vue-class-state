import Vue from 'vue';
import { showInject } from '../dev/show_inject';
import { assert, def } from '../util';
import { getAllState, proxyState, replaceState, subscribe } from './helper';
import { globalMiddleware } from './middleware';

export function StateDecorator(target: object, propertyKey: string) {
    def(target, propertyKey, {
        get() {
            assert(false, `This property [${propertyKey}] must be initialized`);
        },
        set(value) {
            Vue.util.defineReactive(this, propertyKey, value);
            proxyState(this, propertyKey);
        },
        enumerable: true,
        configurable: true
    });
}

export type IStateType = typeof StateDecorator
    & {
        replaceState: typeof replaceState,
        subscribe: typeof subscribe,
        getAllState: typeof getAllState,
        globalSubscribe: typeof globalMiddleware.subscribe,
        showInject: typeof showInject
    };

export const State: IStateType = Object.assign(
    StateDecorator, {
        replaceState,
        subscribe,
        getAllState,
        globalSubscribe: globalMiddleware.subscribe.bind(globalMiddleware),
        showInject
    });
