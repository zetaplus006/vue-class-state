import { def, hideProperty } from '../util';
import { Middleware } from './middleware';

export const scopeKey = '__scope__';

export class ScopeData {

    public $state: any = {};

    public $getters: any = {};

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
