import Vue from 'vue';
import { IContainer } from '../di/container';
import { IPlugin } from './helper';
import { Middleware } from './middleware';
import { IVubxOption } from './observable';

export const scopeKey = '__scope__';

export class ScopeData {
    public $vm: Vue;
    public $getters: any = {};
    public $state: any = {};
    public isRoot: boolean;
    public isCommitting: boolean = false;
    public middleware: Middleware = new Middleware();
    public vubxOption: IVubxOption;
    public module: IContainer;

    public isInitGetters: boolean = false;

    get globalPlugins(): IPlugin[] {
        return this.module._globalPlugins;
    }

    get globalMiddlewate(): Middleware {
        return this.module._globalMiddleware;
    }

    constructor(vubxOption: IVubxOption) {
        this.vubxOption = vubxOption;
    }

    public static get(ctx: any): ScopeData | null {
        return ctx[scopeKey] || null;
    }
}
