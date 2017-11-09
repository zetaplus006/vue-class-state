/**
 * vubx v0.1.6
 * (c) 2017 zetaplus006
 * @license MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function assert(condition, msg) {
    if (!condition)
        throw new Error("[vubx warn] " + msg);
}

var def = Object.defineProperty;

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
};

var meta_key = '__meta__';
var DIMetaData = (function () {
    function DIMetaData() {
        this.hasBeenInjected = false;
    }
    DIMetaData.get = function (ctx) {
        if (!ctx[meta_key]) {
            addDIMeta(ctx);
        }
        return ctx[meta_key];
    };
    return DIMetaData;
}());
function addDIMeta(ctx) {
    def(ctx, meta_key, {
        value: new DIMetaData(),
        enumerable: false
    });
}

var BaseInjector = (function () {
    function BaseInjector() {
        this.isSingleton = true;
    }
    BaseInjector.prototype.addDIMeta = function (instance, identifier) {
        var meta = DIMetaData.get(instance);
        if (meta.hasBeenInjected) {
            return;
        }
        meta.identifier = identifier;
        meta.provider = this.provider;
        this.provider.hooks.forEach(function (fn) { return fn(instance, meta); });
        meta.hasBeenInjected = true;
    };
    return BaseInjector;
}());
var ClassInjector = (function (_super) {
    __extends(ClassInjector, _super);
    function ClassInjector(identifier, isSingleton, serviceClass) {
        var _this = _super.call(this) || this;
        _this.identifier = identifier;
        _this.isSingleton = isSingleton;
        _this.serviceClass = serviceClass;
        return _this;
    }
    ClassInjector.prototype.resolve = function () {
        if (this.isSingleton) {
            if (!this.instance) {
                this.instance = this.getInstance();
            }
            return this.instance;
        }
        else {
            return this.getInstance();
        }
    };
    ClassInjector.prototype.getInstance = function () {
        var instance = new this.serviceClass();
        this.addDIMeta(instance, this.identifier);
        return instance;
    };
    return ClassInjector;
}(BaseInjector));
var ValueInjector = (function (_super) {
    __extends(ValueInjector, _super);
    function ValueInjector(identifier, isSingleton, service) {
        var _this = _super.call(this) || this;
        _this.identifier = identifier;
        _this.isSingleton = isSingleton;
        _this.service = service;
        return _this;
    }
    ValueInjector.prototype.resolve = function () {
        if (!this.instance) {
            this.instance = this.getInstance();
        }
        return this.instance;
    };
    ValueInjector.prototype.getInstance = function () {
        this.addDIMeta(this.service, this.identifier);
        return this.service;
    };
    ValueInjector.prototype.inTransientScope = function () {
        assert(false, 'Value injector not support inTransientScope');
        return this;
    };
    return ValueInjector;
}(BaseInjector));
var FactoryInjector = (function (_super) {
    __extends(FactoryInjector, _super);
    function FactoryInjector(identifier, isSingleton, ServiceFactory, deps) {
        var _this = _super.call(this) || this;
        _this.identifier = identifier;
        _this.isSingleton = isSingleton;
        _this.ServiceFactory = ServiceFactory;
        _this.deps = deps;
        return _this;
    }
    FactoryInjector.prototype.resolve = function () {
        if (this.isSingleton) {
            if (!this.instance) {
                this.instance = this.getInstance();
            }
            return this.instance;
        }
        else {
            return this.getInstance();
        }
    };
    FactoryInjector.prototype.getInstance = function () {
        var args = this.provider.getAll(this.deps);
        var instance = this.ServiceFactory.apply(null, args);
        this.addDIMeta(instance, this.identifier);
        return instance;
    };
    return FactoryInjector;
}(BaseInjector));

var Service = (function () {
    function Service() {
    }
    Service.prototype.replaceState = function (state, replaceChildState) {
        if (replaceChildState === void 0) { replaceChildState = false; }
        var temp = this.__scope__.isCommitting;
        this.__scope__.isCommitting = true;
        for (var key in state) {
            if (this[key] instanceof Service) {
                if (replaceChildState) {
                    this[key].replaceState(state[key]);
                }
            }
            else {
                if (this.hasOwnProperty(key)) {
                    this[key] = state[key];
                }
            }
        }
        this.__scope__.isCommitting = temp;
    };
    Service.prototype.replaceAllState = function (proxyState) {
        DIMetaData.get(this).provider.replaceAllState(proxyState);
    };
    Service.prototype.injectService = function (instance, key, identifier) {
        var provider = DIMetaData.get(this).provider;
        provider.checkIdentifier(identifier);
        provider.register(new ValueInjector(identifier, true, instance));
        def(this, key, {
            value: instance,
            enumerable: false,
            configurable: true
        });
    };
    Service.prototype.subscribe = function (option) {
        this.__scope__.middleware.subscribe(option);
    };
    Service.prototype.subscribeGlobal = function (option) {
        assert(this.__scope__.$root === this, 'Only root service has subscribeGlobal methods');
        this.__scope__.globalMiddlewate.subscribe(option);
    };
    Service.prototype.getProvide = function () {
        return DIMetaData.get(this).provider.proxy;
    };
    return Service;
}());

var Binding = (function () {
    function Binding(identifier) {
        this.isSingleton = true;
        this.identifier = identifier;
    }
    Binding.prototype.toClass = function (serviceClass) {
        var _this = this;
        this.injectorFactory = function () { return new ClassInjector(_this.identifier, _this.isSingleton, serviceClass); };
        return this;
    };
    Binding.prototype.toValue = function (service) {
        var _this = this;
        this.injectorFactory = function () { return new ValueInjector(_this.identifier, _this.isSingleton, service); };
        return this;
    };
    Binding.prototype.toFactory = function (factory, deps) {
        var _this = this;
        if (deps === void 0) { deps = []; }
        this.injectorFactory = function () { return new FactoryInjector(_this.identifier, _this.isSingleton, factory, deps); };
        return this;
    };
    Binding.prototype.inSingletonScope = function () {
        this.isSingleton = true;
        return this;
    };
    Binding.prototype.inTransientScope = function () {
        this.isSingleton = false;
        return this;
    };
    return Binding;
}());
function bind(identifier) {
    return new Binding(identifier);
}

var Provider = (function () {
    function Provider() {
        this.injectorMap = new Map();
        /**
         * for vue provide option
         */
        this.proxy = {};
        this.hooks = [];
    }
    /**
     * get service instance
     * @param identifier
     */
    Provider.prototype.get = function (identifier) {
        var injector = this.injectorMap.get(identifier);
        if (process.env.NODE_ENV !== 'production') {
            assert(injector, identifier.toString() + " not find in provider");
        }
        return injector.resolve();
    };
    /**
     * get service instance array
     * @param deps
     */
    Provider.prototype.getAll = function (deps) {
        var _this = this;
        return deps.map(function (identifier) { return _this.get(identifier); });
    };
    /**
     * register a injector in the provider
     * @param injector
     */
    Provider.prototype.register = function (injector) {
        this.checkIdentifier(injector.identifier);
        injector.provider = this;
        this.injectorMap.set(injector.identifier, injector);
        this.defProxy(injector);
    };
    Provider.prototype.checkIdentifier = function (identifier) {
        if (process.env.NODE_ENV !== 'production') {
            assert(!this.injectorMap.has(identifier), "The identifier " + identifier.toString() + " has been repeated");
        }
    };
    /**
     * replaceState for SSR and devtool
     * @param proxyState
     */
    Provider.prototype.replaceAllState = function (proxyState) {
        for (var key in proxyState) {
            var instance = this.proxy[key];
            if (instance instanceof Service) {
                instance.replaceState(proxyState[key], false);
            }
        }
    };
    Provider.prototype.registerInjectedHook = function (injected) {
        if (this.hooks.indexOf(injected) > -1) {
            return;
        }
        this.hooks.push(injected);
    };
    /**
     * for vue provide option
     * @param injector
     */
    Provider.prototype.defProxy = function (injector) {
        /* if (!injector.isSingleton) {
            return;
        } */
        var desc = {
            get: function () {
                return injector.resolve();
            },
            enumerable: true,
            configurable: true
        };
        def(this.proxy, injector.identifier, desc);
        // for devtool
        if (typeof injector.identifier === 'symbol') {
            def(this.proxy, String(injector.identifier), desc);
        }
    };
    return Provider;
}());

var Middleware = (function () {
    function Middleware() {
        this.beforeSubs = [];
        this.afterSubs = [];
    }
    Middleware.prototype.subscribe = function (option) {
        if (!option)
            return;
        if (option.before) {
            this.beforeSubs.push(option.before);
        }
        if (option.after) {
            this.afterSubs.push(option.after);
        }
    };
    /**
     * get a aop function
     * @param fn
     * @param ctx
     */
    Middleware.prototype.createTask = function (fn, ctx) {
        if (ctx === void 0) { ctx = null; }
        // fn maybe array
        var self = this;
        return function () {
            var arg = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                arg[_i] = arguments[_i];
            }
            self.dispatchBefore.apply(self, [ctx].concat(arg));
            var res = fn.apply(ctx, arg);
            self.dispatchAfter.apply(self, [ctx].concat(arg));
            return res;
        };
    };
    Middleware.prototype.dispatchBefore = function (ctx) {
        var arg = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            arg[_i - 1] = arguments[_i];
        }
        this.run.apply(this, [this.beforeSubs, ctx].concat(arg));
    };
    Middleware.prototype.dispatchAfter = function (ctx) {
        var arg = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            arg[_i - 1] = arguments[_i];
        }
        this.run.apply(this, [this.afterSubs, ctx].concat(arg));
    };
    Middleware.prototype.run = function (subs, ctx) {
        var arg = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            arg[_i - 2] = arguments[_i];
        }
        for (var _a = 0, subs_1 = subs; _a < subs_1.length; _a++) {
            var sub = subs_1[_a];
            // todo if promise
            if (sub.apply(ctx, arg) === false) {
                break;
            }
        }
    };
    return Middleware;
}());

var ClassMetaData = (function () {
    function ClassMetaData(target) {
        this.target = target;
        this.propertyMeta = new Map();
    }
    ClassMetaData.get = function (target) {
        return target.constructor.__meta__ ||
            (target.constructor.__meta__ = new ClassMetaData(target));
    };
    return ClassMetaData;
}());

var defaultConfig = {
    enumerable: true,
    configurable: true
};
var ScopeData = (function () {
    function ScopeData(service, vubxOption) {
        this.$getters = {};
        this.$state = {};
        this.isCommitting = false;
        this.middleware = new Middleware();
        this.isRoot = !!vubxOption.root;
        if (this.isRoot) {
            this._root = service;
            this._globalMiddllewate = new Middleware();
            this._globalPlugins = vubxOption.globalPlugins || [];
        }
        else if (vubxOption.globalPlugins.length > 0) {
            assert(false, 'The globalPlugins option only to be used in root service');
        }
        this.vubxOption = vubxOption;
    }
    Object.defineProperty(ScopeData.prototype, "$root", {
        get: function () {
            assert(this._root, 'There must be a root Service and please check your decorator option');
            return this._root;
        },
        set: function (value) {
            this._root = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScopeData.prototype, "globalPlugins", {
        get: function () {
            return this.$root.__scope__._globalPlugins;
        },
        set: function (value) {
            this.$root.__scope__._globalPlugins = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScopeData.prototype, "globalMiddlewate", {
        get: function () {
            return this.$root.__scope__._globalMiddllewate;
        },
        enumerable: true,
        configurable: true
    });
    return ScopeData;
}());
function proxyState(ctx, getterKeys) {
    var $state = ctx.__scope__.$state;
    Object.keys(ctx).forEach(function (key) {
        if (getterKeys.indexOf(key) < 0) {
            def($state, key, __assign({ get: function () { return ctx[key]; } }, defaultConfig));
        }
    });
    def(ctx, '$state', {
        value: $state,
        enumerable: false
    });
}
function proxyGetters(ctx, vm, getterKeys) {
    var $getters = ctx.__scope__.$getters;
    getterKeys.forEach(function (key) {
        def(ctx, key, {
            get: function () { return vm[key]; },
            set: function (value) { return vm[key] = value; },
            enumerable: false,
            configurable: true
        });
        def($getters, key, __assign({ get: function () { return ctx[key]; }, set: function (value) { return ctx[key] = value; } }, defaultConfig));
    });
    def(ctx, '$getters', {
        value: $getters,
        enumerable: false
    });
}
function getAllGetters(target, ctx) {
    var getters = {};
    var prototypeSuper = target;
    while (prototypeSuper !== Service.prototype
        && prototypeSuper !== Object.prototype
        && prototypeSuper !== null) {
        getters = __assign({}, getPropertyGetters(prototypeSuper, ctx), getters);
        prototypeSuper = Object.getPrototypeOf(prototypeSuper);
    }
    return getters;
}
function getPropertyGetters(target, ctx) {
    var getters = {};
    var meta = ClassMetaData.get(target);
    var keys = Object.getOwnPropertyNames(target);
    keys.forEach(function (key) {
        // skip @lazyInject
        if (key === 'constructor' || meta.propertyMeta.has(key)) {
            return;
        }
        var descriptor = Object.getOwnPropertyDescriptor(target, key);
        if (descriptor.get) {
            getters[key] = {
                get: descriptor.get.bind(ctx),
                set: descriptor.set && descriptor.set.bind(ctx)
            };
        }
    });
    return getters;
}
function useStrict(service) {
    var identifier = DIMetaData.get(service).identifier;
    if (process.env.NODE_ENV !== 'production') {
        service.__scope__.$vm && service.__scope__.$vm.$watch(function () {
            return this.$data;
        }, function (val) {
            assert(service.__scope__.isCommitting, "Do not mutate vubx service[" + String(identifier) + "] data outside mutation handlers.");
        }, { deep: true, sync: true });
    }
}

function devtool(service) {
    var provider = DIMetaData.get(service).provider;
    var devtoolHook = typeof window !== 'undefined' &&
        window['__VUE_DEVTOOLS_GLOBAL_HOOK__'];
    if (!devtoolHook)
        return;
    var store = simulationStore(provider);
    store._devtoolHook = devtoolHook;
    devtoolHook.emit('vuex:init', store);
    devtoolHook.on('vuex:travel-to-state', function (targetState) {
        provider.replaceAllState(targetState);
    });
    service.__scope__.globalMiddlewate.subscribe({
        after: function (mutation, state) {
            devtoolHook.emit('vuex:mutation', mutation, state);
        }
    });
}
function simulationStore(provider) {
    var _a = getStateAndGetters(provider.proxy), state = _a.state, getters = _a.getters;
    var store = {
        state: state,
        getters: getters,
        _devtoolHook: null
    };
    return store;
}
function getStateAndGetters(proxy) {
    var getters = {};
    var state = {};
    var keys = Object.keys(proxy);
    if (Object.getOwnPropertySymbols) {
        keys = keys.concat(Object.getOwnPropertySymbols(proxy));
    }
    keys.forEach(function (key) {
        var instance = proxy[key];
        if (instance instanceof Service) {
            def(getters, key.toString(), {
                value: instance.__scope__.$getters,
                enumerable: true,
                configurable: true
            });
            def(state, key.toString(), {
                value: instance.__scope__.$state,
                enumerable: true,
                configurable: true
            });
        }
    });
    return {
        state: state,
        getters: getters
    };
}

function createDecorator(_Vue) {
    return function decorator(decoratorOption) {
        return function (constructor) {
            return (function (_super) {
                __extends(Vubx, _super);
                function Vubx() {
                    var arg = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        arg[_i] = arguments[_i];
                    }
                    var _this = _super.apply(this, arg) || this;
                    var getters = getAllGetters(constructor.prototype, _this), getterKeys = Object.keys(getters);
                    var vm = new _Vue({
                        data: _this,
                        computed: getters
                    });
                    var option = __assign({ identifier: '__vubx__', root: false, devtool: false, providers: [], plugins: [], globalPlugins: [], createdHook: ClassMetaData.get(constructor.prototype).hookMeta }, decoratorOption);
                    var scope = new ScopeData(_this, option);
                    def(_this, '__scope__', { value: scope, enumerable: false });
                    scope.$vm = vm;
                    proxyState(_this, getterKeys);
                    proxyGetters(_this, vm, getterKeys);
                    if (decoratorOption && decoratorOption.root) {
                        assert(decoratorOption.identifier, 'A root Service must has a identifier and please check your decorator option');
                        scope.$root = _this;
                        var provider_1 = new Provider();
                        provider_1.registerInjectedHook(function (instance, diMeta) {
                            if (instance instanceof Service) {
                                instance.__scope__.$root = _this;
                                createdHook(instance, instance.__scope__.vubxOption, diMeta);
                            }
                        });
                        provider_1.register(new ValueInjector(option.identifier, true, _this));
                        option.providers.forEach(function (binding) { return provider_1.register(binding.injectorFactory()); });
                        var meta = DIMetaData.get(_this);
                        meta.identifier = option.identifier;
                        meta.provider = provider_1;
                        createdHook(_this, option, meta);
                        meta.hasBeenInjected = true;
                        if (option.devtool) {
                            devtool(_this);
                        }
                    }
                    return _this;
                }
                return Vubx;
            }(constructor));
        };
    };
}
function createdHook(service, option, diMeta) {
    initPlugins(service, service.__scope__.globalPlugins.concat(option.plugins));
    var rootOption = service.__scope__.$root.__scope__.vubxOption;
    var strict = option.hasOwnProperty('strict') ? option.strict : rootOption.strict;
    if (strict) {
        useStrict(service);
    }
    var hook = option.createdHook;
    if (hook) {
        var deps = diMeta.provider.getAll(hook.deps);
        hook.method.apply(service, deps);
    }
}
function initPlugins(ctx, plugin) {
    plugin.forEach(function (action) { return action(ctx); });
}

function lazyInject(identifier) {
    return function (target, propertyKey) {
        var serviceKey = identifier || propertyKey;
        var meta = ClassMetaData.get(target);
        meta.propertyMeta.set(propertyKey, {
            identifier: identifier
        });
        return {
            get: function () {
                var service = DIMetaData.get(this).provider.get(serviceKey);
                def(this, propertyKey, {
                    value: service,
                    enumerable: false,
                    configurable: true
                });
                return service;
            },
            enumerable: false,
            configuriable: true
        };
    };
}

function mutation(target, mutationyKey, descriptor) {
    var mutationFn = descriptor.value;
    descriptor.value = function () {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        var rootScope = this.__scope__.$root.__scope__, scope = this.__scope__, meta = DIMetaData.get(this);
        var vubxMutation = {
            type: meta.identifier.toString() + ': ' + mutationyKey,
            payload: arg,
            methodName: mutationyKey,
            identifier: meta.identifier
        };
        var globalMiddleware = rootScope.globalMiddlewate;
        var middleware = scope.middleware;
        var temp = scope.isCommitting;
        scope.isCommitting = true;
        globalMiddleware.dispatchBefore(this, vubxMutation, this);
        middleware.dispatchBefore(this, vubxMutation, this);
        var result = mutationFn.apply(this, arg);
        middleware.dispatchAfter(this, vubxMutation, this);
        globalMiddleware.dispatchAfter(this, vubxMutation, this);
        // arguments is different
        // res =  middleware.createTask(mutationFn, this)(...arg);
        scope.isCommitting = temp;
        return result;
    };
    return descriptor;
}

function created(deps) {
    if (deps === void 0) { deps = []; }
    return function (target, methodName, desc) {
        var meta = ClassMetaData.get(target);
        meta.hookMeta = {
            method: desc.value,
            methodName: methodName,
            deps: deps
        };
    };
}

/**
 * vubx interface
 */
/**
 * vubx api
 */

exports.Service = Service;
exports.bind = bind;
exports.createDecorator = createDecorator;
exports.mutation = mutation;
exports.lazyInject = lazyInject;
exports.created = created;
