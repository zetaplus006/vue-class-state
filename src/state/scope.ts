import Vue from 'vue';
import { def } from '../util';
import { Middleware } from './middleware';

export const scopeKey = '__scope__';

export class ScopeData {
    public $vm: Vue;
    public $getters: any = {};
    public $state: any = {};
    public isCommitting: boolean = false;

    get middleware() {
        const middleware = new Middleware();
        def(this, 'middleware', {
            value: middleware,
            enumerable: true,
            configurable: true
        });
        return middleware;
    }

    public static get(ctx: any): ScopeData | null {
        return ctx[scopeKey] || null;
    }
}
