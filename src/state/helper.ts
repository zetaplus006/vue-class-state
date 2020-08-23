
import Vue from 'vue';
import { devtoolHook } from '../dev/devtool';
import { IMiddleware } from './compose';

export interface IClass<T = any> { new(...args: any[]): T; }

export type IIdentifier = string;

export type IPlugin = (state: any) => void;

// tslint:disable-next-line:no-empty
export const noop = function () { };

export const isSSR = Vue.prototype.$isServer;

export const globalState = {
    middlewares: [] as IMiddleware[],
    isCommitting: false
};

if (process.env.NODE_ENV !== 'production' && devtoolHook) {
    globalState.middlewares.push((next: any, mutation: any, state: any) => {
        const result = next();
        devtoolHook.emit('vuex:mutation', mutation, state);
        return result;
    });
}
