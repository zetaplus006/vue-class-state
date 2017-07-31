import Vue from 'vue';
import { enumerable, mutation } from '../decorator';
import { assert, warn } from '../util';
import { Middleware } from './middleware';
import { AppService } from '../../examples/simple/appService';

const def = Object.defineProperty;

export abstract class Service {
    /**
     * $watch return a function that can close this watcher
     */
    protected $watch: typeof Vue.prototype.$watch;
    protected $on: typeof Vue.prototype.$on;
    protected $once: typeof Vue.prototype.$once;
    protected $emit: typeof Vue.prototype.$emit;
    protected $off: typeof Vue.prototype.$off;
    protected $set: typeof Vue.prototype.$set;
    protected $delete: typeof Vue.prototype.$delete;
    protected $destroy: typeof Vue.prototype.$destroy;

    $getters: any = {};
    $state: any = {};
    $root: Service | null = null;
    $parent: Service | null = null;
    $children: Service[] = [];
    $identifier: string = '';

    __isCommitting: boolean = false;
    __middleware: Middleware = new Middleware();
    /**
     * After initialization has been completed
     */
    protected created?(): void;

    @mutation
    replaceState(state: Service): void {
        const keys = Object.keys(state);
        for (const key in state) {
            if (!this[key]) continue;
            if (this[key] instanceof Service) {
                (this[key] as Service).replaceState(state[key]);
            } else {
                this[key] = state[key];
            }
        }
    }

    appendChild<S extends Service>(child: S, childName: keyof this, identifier?: string): void {
        Service.appendChild(this, childName, child, identifier);
    }

    static appendChild<P extends Service, C extends Service>
        (parent: P, childName: keyof P, child: C, identifier?: string) {
        if (process.env.NODE_ENV !== 'production') {
            if (parent.$children.indexOf(child) > -1) {
                warn('The parent service already has this child service' +
                    'and cannot be added repeatedly');
                return;
            }
            if (child.$parent === parent) {
                warn('Services cannot be mutually parent and child');
                return;
            }
        }
        parent.$children.push(child);
        child.$parent = parent;
        setRoot(parent.$root || parent);
        identifier && (child.$identifier = identifier);
        def(parent, childName, {
            enumerable: true,
            get: () => child
        });
        if (!parent.$getters) {
            parent.$getters = {};
        }
        parent.$getters[childName] = child.$getters;
    }
}

const $gettersKey = '$getters', $stateKey = '$state', $identifierKey = '$identifier', $rootKey = '$root';
const hiddenKey = ['$children', '$parent', $rootKey, $identifierKey, $gettersKey, $stateKey, '__isCommitting', '__middleware'];
export interface IChildOption {
    childName: string;
    child: Service;
    identifier: string;
}
export interface IDecoratorOption {
    strict?: boolean;
    identifier?: string;
    childOption?: IChildOption[];
}
export type IConstructor = { new(...args: any[]): {} };
export type IVubxDecorator = (option?: IDecoratorOption) => (constructor: IConstructor) => any;

/**
 * createObserveDecorator
 * @param _Vue
 */
export function createDecorator(_Vue: typeof Vue): IVubxDecorator {
    return function observable(option?: IDecoratorOption) {
        /**
         * rewirte class constructor to defined observe
         */
        return function observe<T extends { new(...args: any[]): {} }>(constructor: T) {
            const __middleware: Middleware = new Middleware();
            return class Vubx extends constructor {

                constructor(...arg: any[]) {
                    super(...arg);
                    hiddenKey.forEach(key => def(this, key, { enumerable: false }));
                    const getters = getPropertyGetters(constructor.prototype),
                        { created } = constructor.prototype,
                        getterKeys = Object.keys(getters),
                        self = this;
                    const vm: Vue = new _Vue({
                        data: this,
                        computed: getters
                    });
                    proxyState(this, getterKeys);
                    proxyGetters(this, vm, getterKeys);
                    proxyMethod(this, vm);

                    this[$rootKey] = this;
                    if (option) {
                        if (option.strict) {
                            openStrict(vm, this);
                        }
                        if (option.identifier) {
                            this[$identifierKey] = option.identifier;
                        }
                    }
                    created && created.call(this);
                }
            };
        };
    };
}

function proxyGetters(ctx: any, vm: Vue, getterKeys: string[]) {
    const $getters = (ctx as Service).$getters;
    getterKeys.forEach(key => {
        def(ctx, key, {
            get: () => vm[key],
            set: value => vm[key] = value,
            enumerable: true
        });
        def($getters, key, {
            get: () => ctx[key],
            set: value => ctx[key] = value,
            enumerable: true
        });
    });
}

function proxyState(ctx: any, getterKeys: string[]) {
    const $state = (ctx as Service).$state;
    Object.keys(ctx).forEach(
        key => {
            if (getterKeys.indexOf(key) < 0) {
                if (ctx[key] instanceof Service) {
                    $state[key] = ctx[key].$state;
                } else {
                    def($state, key, { get: () => ctx[key], enumerable: true });
                }
            }
        }
    );
}

const vmMethods = ['$watch', '$on', '$once', '$emit', '$off', '$set', '$delete'];

function proxyMethod(ctx: any, vm: Vue) {
    for (const key of vmMethods) {
        def(ctx, key, {
            get: () => vm[key].bind(vm),
            enumerable: false
        });
    }
}

function openStrict(vm: Vue, service: any) {
    if (process.env.NODE_ENV !== 'production') {
        vm.$watch<any>(function () {
            return this.$data;
        }, (val) => {
            assert((service as Service).__isCommitting,
                'Do not mutate vubx service data outside mutation handlers.');
        }, { deep: true, sync: true });
    }
}

function getPropertyGetters(target: any): { [key: string]: { get(): any, set?(): void } } {
    const getters = {};
    const keys: string[] = Object.getOwnPropertyNames(target);
    keys.forEach(key => {
        if (key === 'constructor') { return; }
        const descriptor = Object.getOwnPropertyDescriptor(target, key);
        if (descriptor.get && descriptor.enumerable) {
            getters[key] = {
                get: descriptor.get,
                set: descriptor.set
            };
        }
    });
    return getters;
}

function setRoot(root: Service) {
    root.$children.forEach(s => {
        s.$root = root;
        setRoot(s);
    });
}