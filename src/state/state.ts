import Vue from 'vue';
import { showInject } from '../dev/show_inject';
import { assert, def } from '../util';
import { proxyState } from './helper';
import { globalMiddleware } from './middleware';
import { IMutation } from './mutation';
import { ScopeData, scopeKey } from './scope';

export function StateDecorator(target: object, propertyKey: string) {
    def(target, propertyKey, {
        get() {
            if (process.env.NODE_ENV !== 'production') {
                assert(false, `This property [${propertyKey}] must be initialized`);
            }
        },
        set(value) {
            Vue.util.defineReactive(this, propertyKey, value);
            proxyState(this, propertyKey);
        },
        enumerable: true,
        configurable: true
    });
}

export function replaceState(targetState: any, state: any): void {
    const scope = targetState[scopeKey] as ScopeData || undefined;
    if (scope === undefined) return;
    const temp = scope.isCommitting;
    scope.isCommitting = true;
    for (const key in state) {
        if (targetState.hasOwnProperty(key)) {
            targetState[key] = state[key];
        }
    }
    scope.isCommitting = temp;
}

export function subscribe(
    targetState: any,
    option: {
        before?: (mutation: IMutation, state: any) => any,
        after?: (mutation: IMutation, state: any) => any
    }) {
    const scope = ScopeData.get(targetState);
    scope.middleware.subscribe(option);
}

export function getAllState(state: any) {
    return ScopeData.get(state).$state;
}

export const State = Object.assign(
    StateDecorator, {
        replaceState,
        subscribe,
        getAllState,
        globalSubscribe: globalMiddleware.subscribe.bind(globalMiddleware),
        showInject
    });
