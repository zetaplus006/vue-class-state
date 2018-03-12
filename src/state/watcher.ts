import Vue from 'vue';

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
const _watcher = (vm as any)._computedWatchers[computedKey];
const _dep = (vm as any)._data.__ob__.dep;

export const Watcher: typeof IWatcher = Object.getPrototypeOf(_watcher).constructor;
export const Dep: IDep = Object.getPrototypeOf(_dep).constructor;

vm.$destroy();
