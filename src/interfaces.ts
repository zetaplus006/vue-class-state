// import { Service } from './service/observable';
import { Middleware } from './service/middleware';

import Vue from 'vue';
import { devtool } from './plugins/devtool';
import { Provider } from './di/provider';
import { IInjector } from './di/injector';

export interface IConstructor { new(...args: any[]): {}; }
export interface IServiceClass<T extends IService> { new(...args: any[]): T; }

export interface IDecoratorOption {
    identifier?: IIdentifier;
    root?: boolean;
    providers?: IInjector<IService>[];
    // injectors?: IInjector<IService>[];
    plugins?: IPlugin[];
}
export type IVubxDecorator = (option?: IDecoratorOption) => (constructor: IConstructor) => any;

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

    /*  dispatch(identifier: IIdentifier, actionType: string, ...arg: any[]): Promise<any>;

     commit(identifier: IIdentifier, mutationType: string, ...arg: any[]): any; */

    replaceState(state: IService): void;

    appendChild(child: IService, childName: keyof this, identifier: IIdentifier): void;

    getProvider(): Provider;

    subscribe(option: ISubscribeOption): void;

    useStrict(): this;

    useDevtool(): this;
}

export type IIdentifier = string | symbol;

export type IPlugin = (service: IService) => void;

// middleware

export type ISub = (...arg: any[]) => any;

export type ISubs = ISub[];

export type ISubscribeOption = {
    before?: ISub
    after?: ISub
};

export interface IMutation {
    type: string;
    payload: any;
}
