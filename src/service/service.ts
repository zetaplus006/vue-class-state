import Vue from 'vue';
import { Middleware, ISubscribeOption } from './middleware';
import { Provider } from '../di/provider';
import { IIdentifier, appendServiceChild, IPlugin, VubxHelper } from './helper';
import { def, assert } from '../util';
import { devtool } from '../plugins/devtool';
import { ValueInjector } from '../di/injector';
import { IMutation } from './mutation';

export interface GlobalHelper {
    middleware: Middleware;
    plugins: IPlugin[];
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

    __: VubxHelper;

    created?(): void;

    replaceState(state: IService, replaceChildState?: boolean): void;

    appendChild(child: IService, childName: keyof this, identifier: IIdentifier): void;

    getProvide(): any;

    subscribe(option: IMutationSubscribeOption): void;

    subscribeGlobal(option: IMutationSubscribeOption): void;

    useStrict(): this;

    useDevtool(): this;
}

export type IMutationSubscribe = (mutation: IMutation, service: IService) => any;

export type IMutationSubscribeOption = {
    before?: IMutationSubscribe,
    after?: IMutationSubscribe
};

export abstract class Service implements IService {

    $watch: typeof Vue.prototype.$watch;
    $on: typeof Vue.prototype.$on;
    $once: typeof Vue.prototype.$once;
    $emit: typeof Vue.prototype.$emit;
    $off: typeof Vue.prototype.$off;
    $set: typeof Vue.prototype.$set;
    $delete: typeof Vue.prototype.$delete;
    $destroy: typeof Vue.prototype.$destroy;

    __: VubxHelper;

    /**
     * After initialization has been completed
     */
    created?(): void;

    replaceState(state: IService, replaceChildState = true): void {
        const temp = this.__.isCommitting;
        this.__.isCommitting = true;
        for (const key in state) {
            if (this[key] instanceof Service) {
                if (replaceChildState) {
                    (this[key] as IService).replaceState(state[key]);
                }
            } else {
                this[key] = state[key];
            }
        }
        this.__.isCommitting = temp;
    }

    appendChild(child: IService, key: keyof this, identifier: IIdentifier): void {
        this.__.provider.checkIdentifier(identifier);
        this.__.provider.register(new ValueInjector(identifier, child));
        appendServiceChild(this, key, this.__.provider.get(identifier), identifier, this.__.$root);
        def(this, key, {
            enumerable: true,
            value: child
        });
    }

    getProvide() {
        return this.__.provider.proxy;
    }

    subscribe(option: IMutationSubscribeOption) {
        this.__.middleware.subscribe(option);
    }

    subscribeGlobal(option: IMutationSubscribeOption) {
        assert(this.__.$root === this, 'Only root service has subscribeGlobal methods');
        this.__.globalMiddlewate.subscribe(option);
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

    /**
     * use vuex devtool
     * @param useDevtool defalut true
     */
    useDevtool(useDevtool = true) {
        useDevtool && devtool(this);
        return this;
    }

}