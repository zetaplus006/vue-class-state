import Vue from 'vue';
import { Middleware, ISubscribeOption } from './middleware';
import { Provider } from '../di/provider';
import { IIdentifier, IPlugin, ScopeData } from './helper';
import { def, assert } from '../util';
import { ValueInjector } from '../di/injector';
import { IMutation, runInMutaion } from './mutation';
import { ClassMetaData } from '../di/class_meta';
import { DIMetaData } from '../di/di_meta';

export interface IService {

    $state: any;

    $getters: any;

    mutation(fn: Function, mutationType: string): any;

    replaceState(state: IService, replaceChildState?: boolean): void;

    replaceAllState(proxyState: any): void;

    subscribe(option: IMutationSubscribeOption): void;

    subscribeGlobal(option: IMutationSubscribeOption): void;

    injectService(instance: IService, key: keyof this, identifier: IIdentifier): void;

    getProvide(): any;

}

export type IMutationSubscribe = (mutation: IMutation, service: IService) => any;

export type IMutationSubscribeOption = {
    before?: IMutationSubscribe,
    after?: IMutationSubscribe
};

export abstract class Service implements IService {

    $state: any;

    $getters: any;

    mutation(fn: Function, mutationType?: string): any {
        return runInMutaion(this, fn, null, mutationType);
    }

    replaceState(state: IService, replaceChildState = false): void {
        const temp = this.__scope__.isCommitting;
        this.__scope__.isCommitting = true;
        for (const key in state) {
            if (this[key] instanceof Service) {
                if (replaceChildState) {
                    (this[key] as IService).replaceState(state[key]);
                }
            } else {
                if (this.hasOwnProperty(key)) {
                    this[key] = state[key];
                }
            }
        }
        this.__scope__.isCommitting = temp;
    }

    replaceAllState(proxyState: any) {
        DIMetaData.get(this).provider.replaceAllState(proxyState);
    }

    injectService(instance: any, key: keyof this, identifier: IIdentifier): void {
        const provider = DIMetaData.get(this).provider;
        provider.checkIdentifier(identifier);
        provider.register(new ValueInjector(identifier, true, instance));
        def(this, key, {
            value: instance,
            enumerable: false,
            configurable: true
        });
    }

    subscribe(option: IMutationSubscribeOption) {
        this.__scope__.middleware.subscribe(option);
    }

    getProvide() {
        return DIMetaData.get(this).provider.proxy;
    }

}