import Vue from 'vue';
import { ClassMetaData, IGetters } from '../di/class_meta';
import { assert, def, hideProperty } from '../util';
import { proxyGetters, proxyState } from './helper';
import { ScopeData, scopeKey } from './scope';

export function State(target: object, propertyKey: string) {
    def(target, propertyKey, {
        get() {
            assert(false, 'must be init data');
        },
        set(value) {
            checkScope(this, target);
            Vue.util.defineReactive(this, propertyKey, value);
            proxyState(this, propertyKey);
        },
        enumerable: true,
        configurable: true
    });
}

export function Getter(target: object, propertyKey: string) {
    ClassMetaData.addGetterMeta(target, propertyKey);
    return {
        get() {
            checkScope(this, target);
            const get = () => (this[scopeKey] as ScopeData).$vm[propertyKey];
            def(this, propertyKey, {
                get,
                enumerable: false,
                configurable: true
            });
            return get.call(this);
        },
        enumerable: false,
        configurable: true
    };
}

export function checkScope(ctx: any, target: any) {
    if (!ScopeData.get(ctx)) {
        initScope(ctx, target);
    }
}

export function initScope(ctx: any, target: any) {
    const meta = ClassMetaData.get(target);
    const vm: Vue = new Vue({
        computed: bindGetters(meta.getterMeta, meta.getterKeys, ctx)
    });
    const scope = new ScopeData();
    hideProperty(ctx, scopeKey, scope);
    scope.$vm = vm;
    proxyGetters(ctx, meta.getterKeys);
}

function bindGetters(getters: IGetters, keys: string[], ctx: object) {
    const returnGetters = {};
    keys.forEach((key) => {
        returnGetters[key] = {
            get: getters[key].get.bind(ctx)
        };
    });
    return returnGetters;
}
