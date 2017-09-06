import Vue from 'vue';
import { Middleware, ISubscribeOption } from './middleware';
import { Provider } from '../di/provider';
import { IIdentifier, appendServiceChild } from './helper';
import { def, assert } from '../util';
import { devtool } from '../plugins/devtool';
import { ValueInjector } from '../di/injector';

export interface IVubxHelper {
    $vm: Vue | null;
    $getters: any;
    $state: any;
    $root: IService | null;
    $parent: IService[];
    $children: IService[];
    isCommitting: boolean;
    middleware: Middleware;
    provider: Provider | null;
    identifier: IIdentifier;
}

export interface IService {
    $watch: typeof Vue.prototype.$watch;
    $on: typeof Vue.prototype.$on;
    $once: typeof Vue.prototype.$once;
    $emit: typeof Vue.prototype.$emit;
    $off: typeof Vue.prototype.$off;
    $set: typeof Vue.prototype.$set;
    $delete: typeof Vue.prototype.$delete;
    $destroy: typeof Vue.prototype.$destroy;

    __: IVubxHelper;

    created?(): void;

    replaceState(state: IService): void;

    appendChild(child: IService, childName: keyof this, identifier: IIdentifier): void;

    getProvider(): Provider;

    subscribe(option: ISubscribeOption): void;

    useStrict(): this;

    useDevtool(): this;
}

export abstract class Service implements IService {

    $watch: typeof Vue.prototype.$watch;
    $on: typeof Vue.prototype.$on;
    $once: typeof Vue.prototype.$once;
    $emit: typeof Vue.prototype.$emit;
    $off: typeof Vue.prototype.$off;
    $set: typeof Vue.prototype.$set;
    $delete: typeof Vue.prototype.$delete;
    $destroy: typeof Vue.prototype.$destroy;

    __: IVubxHelper = {
        $vm: null,
        $getters: {},
        $state: {},
        $root: null,
        $parent: [],
        $children: [],
        isCommitting: false,
        middleware: new Middleware(),
        provider: null,
        identifier: '__vubx__'
    };

    /**
     * After initialization has been completed
     */
    created?(): void;

    replaceState(state: IService): void {
        const temp = this.__.isCommitting;
        this.__.isCommitting = true;
        for (const key in state) {
            if (this[key] instanceof Service) {
                (this[key] as IService).replaceState(state[key]);
            } else {
                this[key] = state[key];
            }
        }
        this.__.isCommitting = temp;
    }

    appendChild(child: IService, key: keyof this, identifier: IIdentifier): void {
        this.getProvider().checkIdentifier(identifier);
        def(this, key, {
            enumerable: true,
            get: () => child
        });
        appendServiceChild(this, key, child, identifier);
        // this.__.$root && this.__.$root.getProvider().push(identifier, child);
        this.__.$root && this.__.$root.getProvider().register(new ValueInjector(identifier, child));
    }

    getProvider(): Provider {
        if (process.env.NODE_ENV !== 'production') {
            assert(this.__.$root,
                'Make sure to have a root service, ' +
                'Please check the root options in the decorator configuration');
        }
        return (this.__.$root as IService).__.provider as Provider;
    }

    subscribe(option: ISubscribeOption) {
        this.__.middleware.subscribe(option);
    }

    useStrict(isStrict = true) {
        if (isStrict && process.env.NODE_ENV !== 'production') {
            this.__.$vm && this.__.$vm.$watch<any>(function () {
                return this.$data;
            }, (val) => {
                assert(this.__.isCommitting,
                    'Do not mutate vubx service data outside mutation handlers.');
            }, { deep: true, sync: true });
        }
        return this;
    }

    useDevtool(useDevtool = true) {
        useDevtool && devtool(this);
        return this;
    }

}