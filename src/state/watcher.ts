import Vue from 'vue';
import { isSSR } from './helper';

export interface IWatcherOption {
    lazy: boolean;
    // computed for next vue version(>2.5.15)
    computed: boolean;
}

export declare class IWatcher {
    constructor(
        vm: any,
        expOrFn: () => any,
        cb: () => any,
        options?: IWatcherOption
    );
    public value: any;
    public dirty: boolean;
    public evaluate(): void;
    public depend(): void;
}

export interface IDep {
    target: any;
}

let _watcher, _dep, Watcher: typeof IWatcher, Dep: IDep;
if (!isSSR) {
    const computedKey = 'c';
    const vm = new Vue({
        data: {
            a: 1
        },
        computed: {
            [computedKey]() {
                return 1;
            }
        }
    });
    vm.$destroy();
    _watcher = (vm as any)._computedWatchers[computedKey];
    _dep = (vm as any)._data.__ob__.dep;
    Watcher = Object.getPrototypeOf(_watcher).constructor;
    Dep = Object.getPrototypeOf(_dep).constructor;
}
export {
    Watcher,
    Dep
};
