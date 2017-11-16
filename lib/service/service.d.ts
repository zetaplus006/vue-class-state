import { Middleware } from './middleware';
import { IIdentifier, IPlugin } from './helper';
import { IMutation } from './mutation';
export interface GlobalHelper {
    middleware: Middleware;
    plugins: IPlugin[];
}
export interface IService {
    $state: any;
    $getters: any;
    replaceState(state: IService, replaceChildState?: boolean): void;
    replaceAllState(proxyState: any): void;
    subscribe(option: IMutationSubscribeOption): void;
    subscribeGlobal(option: IMutationSubscribeOption): void;
    injectService(instance: IService, key: keyof this, identifier: IIdentifier): void;
    getProvide(): any;
}
export declare type IMutationSubscribe = (mutation: IMutation, service: IService) => any;
export declare type IMutationSubscribeOption = {
    before?: IMutationSubscribe;
    after?: IMutationSubscribe;
};
export declare abstract class Service implements IService {
    $state: any;
    $getters: any;
    replaceState(state: IService, replaceChildState?: boolean): void;
    replaceAllState(proxyState: any): void;
    injectService(instance: any, key: keyof this, identifier: IIdentifier): void;
    subscribe(option: IMutationSubscribeOption): void;
    subscribeGlobal(option: IMutationSubscribeOption): void;
    getProvide(): any;
}
