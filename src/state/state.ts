import Vue from 'vue';
import { showInject } from '../dev/show_inject';
import { assert, def, defGet, hasOwn } from '../util';
import { isSSR, noop } from './helper';
import { allowChange } from './mutation';
import { ScopeData, scopeKey } from './scope';

export const StateDecorator = isSSR
    // tslint:disable-next-line:no-empty
    ? noop as PropertyDecorator
    : function (target: object, propertyKey: string) {
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
    };

export function replaceState(targetState: any, state: any): void {
    const scope = targetState[scopeKey] as ScopeData || undefined;
    if (scope === undefined) return;
    allowChange(() => {
        for (const key in state) {
            if (hasOwn(targetState, key)) {
                targetState[key] = state[key];
            }
        }
    });
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
