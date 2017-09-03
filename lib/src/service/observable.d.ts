import Vue from 'vue';
import { IVubxHelper, IVubxDecorator, IIdentifier, IService, ISubscribeOption } from '../interfaces';
import { Provider } from './provider';
export declare abstract class Service implements IService {
    $watch: typeof Vue.prototype.$watch;
    $on: typeof Vue.prototype.$on;
    $once: typeof Vue.prototype.$once;
    $emit: typeof Vue.prototype.$emit;
    $off: typeof Vue.prototype.$off;
    $set: typeof Vue.prototype.$set;
    $delete: typeof Vue.prototype.$delete;
    $destroy: typeof Vue.prototype.$destroy;
    __: IVubxHelper;
    /**
     * After initialization has been completed
     */
    created?(): void;
    replaceState(state: IService): void;
    appendChild(child: IService, key: keyof this, identifier: IIdentifier): void;
    getProvider(): Provider;
    subscribe(option: ISubscribeOption): void;
    useStrict(isStrict?: boolean): this;
    useDevtool(useDevtool?: boolean): this;
}
/**
 * createObserveDecorator
 * @param _Vue
 */
export declare function createDecorator(_Vue: typeof Vue): IVubxDecorator;
export declare function appendServiceChild<P extends Service, C extends Service>(parent: P, childName: keyof P, child: C, identifier: IIdentifier): void;
