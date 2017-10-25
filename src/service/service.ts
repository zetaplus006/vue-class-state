import Vue from 'vue';
import { Middleware, ISubscribeOption } from './middleware';
import { Provider } from '../di/provider';
import { IIdentifier, appendServiceChild, IPlugin, ScopeData } from './helper';
import { def, assert } from '../util';
import { devtool } from '../plugins/devtool';
import { ValueInjector } from '../di/injector';
import { IMutation } from './mutation';

export interface GlobalHelper {
    middleware: Middleware;
    plugins: IPlugin[];
}

export interface IService {

    $proxy: any;

    __scope__: ScopeData;

    replaceState(state: IService, replaceChildState?: boolean): void;

    replaceAllState(proxyState: any): void;

    appendChild(child: IService, childName: keyof this, identifier: IIdentifier): void;

    getProvide(): any;

    subscribe(option: IMutationSubscribeOption): void;

    subscribeGlobal(option: IMutationSubscribeOption): void;

}

export type IMutationSubscribe = (mutation: IMutation, service: IService) => any;

export type IMutationSubscribeOption = {
    before?: IMutationSubscribe,
    after?: IMutationSubscribe
};

export abstract class Service implements IService {

    get $proxy() {
        return this.__scope__.provider.proxy;
    }

    __scope__: ScopeData;

    replaceState(state: IService, replaceChildState = true): void {
        const root = this.__scope__.$root;
        const temp = root.__scope__.isCommitting;
        root.__scope__.isCommitting = true;
        for (const key in state) {
            if (this[key] instanceof Service) {
                if (replaceChildState) {
                    (this[key] as IService).replaceState(state[key]);
                }
            } else {
                this[key] = state[key];
            }
        }
        root.__scope__.isCommitting = temp;
    }

    replaceAllState(proxyState: any) {
        this.__scope__.provider.replaceAllState(proxyState);
    }

    appendChild(child: IService, key: keyof this, identifier: IIdentifier): void {
        this.__scope__.provider.checkIdentifier(identifier);
        this.__scope__.provider.register(new ValueInjector(identifier, child));
        appendServiceChild(this, key, this.__scope__.provider.get(identifier), identifier, this.__scope__.$root);
        def(this, key, {
            enumerable: false,
            value: child
        });
    }

    getProvide() {
        return this.__scope__.provider.proxy;
    }

    subscribe(option: IMutationSubscribeOption) {
        this.__scope__.middleware.subscribe(option);
    }

    subscribeGlobal(option: IMutationSubscribeOption) {
        assert(this.__scope__.$root === this, 'Only root service has subscribeGlobal methods');
        this.__scope__.globalMiddlewate.subscribe(option);
    }

}