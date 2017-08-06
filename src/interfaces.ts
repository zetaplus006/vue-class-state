import { Service } from './service/observable';
import { Middleware } from './service/middleware';
import { Provider } from './service/provider';
import Vue from 'vue';

export type IConstructor = { new(...args: any[]): {} };
export type IServiceClass<T extends Service> = { new(...args: any[]): T };

export interface IDecoratorOption {
    strict?: boolean;
    identifier?: IIentifier;
    root?: boolean;
    provider?: IPlugin[];
    injector?: IPlugin[];
}
export type IVubxDecorator = (option?: IDecoratorOption) => (constructor: IConstructor) => any;

export interface IVubxHelper {
    $getters: any;
    $state: any;
    $root: Service | null;
    $parent: Service[];
    $children: Service[];
    isCommitting: boolean;
    middleware: Middleware;
    provider: Provider | null;
    identifier: IIentifier;
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

    dispatch(identifier: IIentifier, actionType: string, ...arg: any[]): Promise<any>;

    commit(identifier: IIentifier, mutationType: string, ...arg: any[]): any;

    replaceState(state: Service): void;

    appendChild<S extends Service>(child: S, childName: keyof this, identifier: IIentifier): void;

    getProvider(): Provider;
}

export type IIentifier = string | symbol;

export type IPlugin = (service: Service) => void;

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