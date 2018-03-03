/**
 * change from https://github.com/vuejs/vue/blob/dev/src/core/instance/state.js#L163
 */
import Vue from 'vue';
import { ClassMetaData } from '../di/class_meta';
import { defGet } from '../util';
import { ScopeData } from './scope';
import { Dep, IWatcher, Watcher } from './watcher';

export const inBrowser = typeof window !== 'undefined';

// tslint:disable-next-line:no-empty
const noop = function () { };
const computedWatcherOptions = { lazy: true };

export function Computed(target: object, propertyKey: string): PropertyDescriptor {
    const get = Object.getOwnPropertyDescriptor(target, propertyKey)!.get || noop;
    ClassMetaData.get(target).addGetterKey(propertyKey);
    return {
        get() {
            if (Vue.prototype.$isServer) {
                return get.call(this);
            }
            const scope = ScopeData.get(this);
            const watcher = scope.watchers[propertyKey] = new Watcher(
                scope.$vm,
                get.bind(this),
                noop,
                computedWatcherOptions
            );
            const getter = createComputedGetter(watcher);
            defGet(this, propertyKey, getter);
            defGet(scope.$getters, propertyKey, () => this[propertyKey]);
            return getter.call(this);
        },
        enumerable: false,
        configurable: true
    };
}

function createComputedGetter(watcher: IWatcher) {
    return function computedGetter(this: any) {
        if (watcher) {
            if (watcher.dirty) {
                watcher.evaluate();
            }
            if (Dep.target) {
                watcher.depend();
            }
            return watcher.value;
        }
    };
}
