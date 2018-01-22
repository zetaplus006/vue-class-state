import Vue from 'vue';
import { IService } from './service';
import { Middleware } from './middleware';
import { IVubxOption } from './observable';
export declare type IConstructor = {
    new (...args: any[]): {};
};
export declare type IServiceClass<T> = {
    new (...args: any[]): T;
};
export declare type IIdentifier = string | symbol;
export declare type IPlugin = (service: IService) => void;
export declare class ScopeData {
    $vm: Vue;
    $getters: any;
    $state: any;
    isRoot: boolean;
    isCommitting: boolean;
    middleware: Middleware;
    vubxOption: IVubxOption;
    private _root;
    $root: IService;
    private _globalPlugins;
    globalPlugins: IPlugin[];
    private _globalMiddllewate;
    readonly globalMiddlewate: Middleware;
    constructor(service: IService, vubxOption: IVubxOption);
}
export declare function proxyState(ctx: any, getterKeys: string[]): void;
export declare function proxyGetters(ctx: any, vm: Vue, getterKeys: string[]): void;
export declare function definedComputed(proto: Object, getterKeys: string[]): void;
export declare function getAllGetters(target: any): {};
export declare function getPropertyGetters(target: any): {
    [key: string]: {
        get(): any;
        set?(): void;
    };
};
export declare function useStrict(service: IService): void;
