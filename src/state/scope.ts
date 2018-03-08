import { hideProperty } from '../util';

export const scopeKey = '__scope__';

export class ScopeData {

    public $state: any = {};

    public $getters: any = {};

    public static get(ctx: any): ScopeData {
        return ctx[scopeKey] || (function () {
            const scope = new ScopeData();
            hideProperty(ctx, scopeKey, scope);
            return scope;
        })();
    }

}
