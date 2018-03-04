/**
 * change from https://github.com/vuejs/vue/blob/dev/src/core/instance/state.js#L163
 */
import Vue from 'vue';
import { ClassMetaData } from '../di/class_meta';
import { def, defGet } from '../util';
import { ScopeData } from './scope';
import { Dep, IWatcher, Watcher } from './watcher';

// tslint:disable-next-line:no-empty
const noop = function () { };

export interface IComputedOption {
    enumerable: boolean;
}
const defaultComputedOption: IComputedOption = { enumerable: false };

const computedWatcherOptions = { lazy: true };

export function Computed(option: IComputedOption): any;
export function Computed(target: object, propertyKey: string): any;
export function Computed(targetOrOption: any, propertyKey?: string): any {
    if (propertyKey) {
        return createComputed(defaultComputedOption, targetOrOption, propertyKey);
    } else {
        return function (target: object, key: string) {
            return createComputed(targetOrOption, target, key);
        };
    }
}

export function createComputed(option: IComputedOption, target: any, propertyKey: string): PropertyDescriptor {
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
            def(this, propertyKey, {
                get: getter,
                enumerable: option.enumerable,
                configurable: true
            });
            defGet(scope.$getters, propertyKey, () => this[propertyKey]);
            return getter.call(this);
        },
        enumerable: option.enumerable,
        configurable: true
    };
}

function createComputedGetter(watcher: IWatcher) {
    return function computedGetter(this: any) {
        if (watcher.dirty) {
            watcher.evaluate();
        }
        if (Dep.target) {
            watcher.depend();
        }
        return watcher.value;
    };
}
