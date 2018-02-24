import { DIMetaData } from '../di/di_meta';
import { ValueInjector } from '../di/injector';
import { def } from '../util';
import { IIdentifier } from './helper';
import { IMutation, runInMutaion } from './mutation';

export interface IService {

    $state: any;

    $getters: any;

    mutation (fn: () => void, mutationType: string): any;

    replaceState (state: IService, replaceChildState?: boolean): void;

    replaceAllState (proxyState: any): void;

    subscribe (option: IMutationSubscribeOption): void;

    subscribeGlobal (option: IMutationSubscribeOption): void;

    injectService (instance: IService, key: keyof this, identifier: IIdentifier): void;

}

export type IMutationSubscribe = (mutation: IMutation, service: IService) => any;

export interface IMutationSubscribeOption {
    before?: IMutationSubscribe;
    after?: IMutationSubscribe;
}

export abstract class Service implements IService {

    public $state: any;

    public $getters: any;

    public mutation (fn: () => void, mutationType?: string): any {
        return runInMutaion(this, fn, null, mutationType);
    }

    public replaceState (state: IService, replaceChildState = false): void {
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

    public replaceAllState (proxyState: any) {
        DIMetaData.get(this).provider.replaceAllState(proxyState);
    }

    public injectService (instance: any, key: keyof this, identifier: IIdentifier): void {
        const provider = DIMetaData.get(this).provider;
        provider.checkIdentifier(identifier);
        provider.register(new ValueInjector(identifier, true, instance));
        def(this, key, {
            value: instance,
            enumerable: false,
            configurable: true
        });
    }

    public subscribe (option: IMutationSubscribeOption) {
        this.__scope__.middleware.subscribe(option);
    }

}
