// import { Service as S, default } from '../src/index';
import Vue, { PluginFunction } from 'vue';

export class Service {
    /**
     * $watch  return a function that can close this watcher
     */
    protected $watch: typeof Vue.prototype.$watch;
    protected $on: typeof Vue.prototype.$on
    protected $once: typeof Vue.prototype.$once
    protected $emit: typeof Vue.prototype.$emit
    protected $off: typeof Vue.prototype.$off
    protected $set: typeof Vue.prototype.$set
    protected $delete: typeof Vue.prototype.$delete
    protected $destroy: typeof Vue.prototype.$destroy

    protected replaceState(): void
}

declare class V {
    install: PluginFunction<any>
}

declare class Vues extends V { }

