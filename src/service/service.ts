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

    $proxy: any;

    __: VubxHelper;

    created?(): void;

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
        return this.__.provider.proxy;
    }

    __: VubxHelper;

    /**
     * After initialization has been completed
     */
    created?(): void;

    replaceState(state: IService, replaceChildState = true): void {
        const root = this.__.$root;
        const temp = root.__.isCommitting;
        root.__.isCommitting = true;
        for (const key in state) {
            if (this[key] instanceof Service) {
                if (replaceChildState) {
                    (this[key] as IService).replaceState(state[key]);
                }
            } else {
                this[key] = state[key];
            }
        }
        root.__.isCommitting = temp;
    }

    replaceAllState(proxyState: any) {
        this.__.provider.replaceAllState(proxyState);
    }

    appendChild(child: IService, key: keyof this, identifier: IIdentifier): void {
        this.__.provider.checkIdentifier(identifier);
        this.__.provider.register(new ValueInjector(identifier, child));
        appendServiceChild(this, key, this.__.provider.get(identifier), identifier, this.__.$root);
        def(this, key, {
            enumerable: false,
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

}