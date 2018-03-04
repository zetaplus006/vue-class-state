import Vue from 'vue';
import { def, hideProperty } from '../util';
import { Middleware } from './middleware';
import { IWatcher } from './watcher';

export const scopeKey = '__scope__';

export class ScopeData {
    public $vm: Vue = new Vue();

    public $state: any = {};

    public $getters: any = {};

    public watchers: { [key: string]: IWatcher } = {};

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

    public static get(ctx: any): ScopeData {
        return ctx[scopeKey] || (function () {
            const scope = new ScopeData();
            hideProperty(ctx, scopeKey, scope);
            return scope;
        })();
    }

}
