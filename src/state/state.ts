import Vue from 'vue';
import { showInject } from '../dev/show_inject';
import { assert, def, defGet } from '../util';
import { globalState } from './helper';
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
            defGet(ScopeData.get(this).$state, propertyKey, () => this[propertyKey]);
        },
        enumerable: true,
        configurable: true
    });
}

export function replaceState(targetState: any, state: any): void {
    const scope = targetState[scopeKey] as ScopeData || undefined;
    if (scope === undefined) return;
    const temp = globalState.isCommitting;
    globalState.isCommitting = true;
    try {
        for (const key in state) {
            if (targetState.hasOwnProperty(key)) {
                targetState[key] = state[key];
            }
        }
    } catch (error) {
        throw error;
    } finally {
        globalState.isCommitting = temp;
    }
}

export function getAllState(state: any) {
    return ScopeData.get(state).$state;
}

export const State = Object.assign(
    StateDecorator, {
        replaceState,
        getAllState,
        showInject
    });
