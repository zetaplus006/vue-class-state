/**
 * vubx v0.0.1
 * (c) 2017 zetaplus006
 * @license MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Vubx = {})));
}(this, (function (exports) { 'use strict';

function devtool(service) {
    var devtoolHook = typeof window !== 'undefined' &&
        window['__VUE_DEVTOOLS_GLOBAL_HOOK__'];
    if (!devtoolHook)
        return;
    var store = simulationStore(service);
    store._devtoolHook = devtoolHook;
    devtoolHook.emit('vuex:init', store);
    devtoolHook.on('vuex:travel-to-state', function (targetState) {
        service.replaceState(targetState);
    });
    service.__.middleware.subscribe({
        after: function (mutation, state) {
            devtoolHook.emit('vuex:mutation', mutation, state);
        }
    });
}
function simulationStore(service) {
    var store = {
        state: service.__.$state,
        getters: service.__.$getters,
        _devtoolHook: null
    };
    return store;
}

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











function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function assert(condition, msg) {
    if (!condition)
        throw new Error("[vubx warn] " + msg);
}

var def = Object.defineProperty;

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
    Middleware.prototype.createTask = function (fn, ctx) {
        if (ctx === void 0) { ctx = null; }
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
            if (sub.apply(ctx, arg) === false) {
                break;
            }
        }
    };
    return Middleware;
}());

function lazyInject(key, identifier) {
    return function resolve(parent) {
        var instance;
        def(parent, key, {
            get: function () {
                if (instance) {
                    return instance;
                }
                var provider = parent.getProvider();
                instance = provider.getInstance(identifier);
                appendServiceChild(parent, key, instance, identifier);
                return instance;
            },
            enumerable: true,
            configurable: true
        });
    };
}

function bindClass(identifier, serviceClass) {
    return function registerClass(parent) {
        parent.getProvider().register(identifier, serviceClass);
    };
}
function bindFactory(identifier, serviceFactory) {
    return function registerFactory(parent) {
        parent.getProvider().push(identifier, serviceFactory());
    };
}
var Provider = (function () {
    function Provider() {
        this.instancesMap = new Map();
        this.classMap = new Map();
        this.proxy = {};
    }
    Object.defineProperty(Provider.prototype, "instances", {
        get: function () {
            return Array.from(this.instancesMap);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Provider.prototype, "classes", {
        get: function () {
            return Array.from(this.classMap);
        },
        enumerable: true,
        configurable: true
    });
    Provider.prototype.register = function (identifier, serviceClass) {
        this.checkIdentifier(identifier);
        this.classMap.set(identifier, serviceClass);
        this.defProxy(identifier);
    };
    Provider.prototype.push = function (identifier, service) {
        this.checkIdentifier(identifier);
        this.instancesMap.set(identifier, service);
        this.defProxy(identifier);
    };
    Provider.prototype.defProxy = function (identifier) {
        var _this = this;
        def(this.proxy, identifier, {
            get: function () {
                return _this.getInstance(identifier);
            },
            enumerable: true,
            configurable: true
        });
    };
    Provider.prototype.getInstance = function (identifier) {
        if (!this.instancesMap.has(identifier)) {
            var serviceClass = this.classMap.get(identifier);
            if ("development" !== 'production') {
                assert(serviceClass, identifier.toString() + " can not find this class");
            }
            serviceClass && this.instancesMap.set(identifier, new serviceClass());
        }
        return this.instancesMap.get(identifier);
    };
    Provider.prototype.removeInstance = function (identifier) {
        if ("development" !== 'production') {
            assert(this.instancesMap.has(identifier), "Can not find this instance : identifier[" + identifier.toString() + "]");
        }
        this.instancesMap.delete(identifier);
    };
    Provider.prototype.checkIdentifier = function (identifier) {
        if ("development" !== 'production') {
            assert(!this.classMap.has(identifier)
                && !this.instancesMap.has(identifier), "The identifier " + identifier.toString() + " has been repeated");
        }
    };
    Provider.prototype.hasInstance = function (identifier) {
        return this.instancesMap.has(identifier);
    };
    Provider.prototype.hasClass = function (identifier) {
        return this.classMap.has(identifier);
    };
    return Provider;
}());

var Service = (function () {
    function Service() {
        this.__ = {
            $getters: {},
            $state: {},
            $root: null,
            $parent: [],
            $children: [],
            isCommitting: false,
            middleware: new Middleware(),
            provider: null,
            identifier: '__vubx__'
        };
    }
    Service.prototype.dispatch = function (identifier, actionType) {
        var arg = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            arg[_i - 2] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, (_a = this.getProvider().getInstance(identifier))[actionType].apply(_a, arg)];
                    case 1: return [2, _b.sent()];
                }
            });
        });
    };
    Service.prototype.commit = function (identifier, mutationType) {
        var arg = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            arg[_i - 2] = arguments[_i];
        }
        return (_a = this.getProvider().getInstance(identifier))[mutationType].apply(_a, arg);
        var _a;
    };
    Service.prototype.replaceState = function (state) {
        var temp = this.__.isCommitting;
        this.__.isCommitting = true;
        for (var key in state) {
            if (this[key] instanceof Service) {
                this[key].replaceState(state[key]);
            }
            else {
                this[key] = state[key];
            }
        }
        this.__.isCommitting = temp;
    };
    Service.prototype.appendChild = function (child, key, identifier) {
        this.getProvider().checkIdentifier(identifier);
        def(this, key, {
            enumerable: true,
            get: function () { return child; }
        });
        appendServiceChild(this, key, child, identifier);
        this.__.$root && this.__.$root.getProvider().push(identifier, child);
    };
    Service.prototype.getProvider = function () {
        if ("development" !== 'production') {
            assert(this.__.$root, 'Make sure to have a root service, ' +
                'Please check the root options in the decorator configuration');
        }
        return this.__.$root.__.provider;
    };
    Service.prototype.subscribe = function (option) {
        this.__.middleware.subscribe(option);
    };
    return Service;
}());
function createDecorator(_Vue) {
    return function decorator(option) {
        return function (constructor) {
            return (function (_super) {
                __extends(Vubx, _super);
                function Vubx() {
                    var arg = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        arg[_i] = arguments[_i];
                    }
                    var _this = _super.apply(this, arg) || this;
                    def(_this, '__', { enumerable: false });
                    var getters = getPropertyGetters(constructor.prototype), created = constructor.prototype.created, getterKeys = Object.keys(getters);
                    var vm = new _Vue({
                        data: _this,
                        computed: getters
                    });
                    proxyState(_this, getterKeys);
                    proxyGetters(_this, vm, getterKeys);
                    proxyMethod(_this, vm);
                    var __ = _this['__'];
                    if (option) {
                        var strict = option.strict, root = option.root, identifier = option.identifier, _a = option.provider, provider = _a === void 0 ? [] : _a, _b = option.injector, injector = _b === void 0 ? [] : _b, _c = option.plugins, plugins = _c === void 0 ? [] : _c;
                        strict && openStrict(vm, _this);
                        if (root) {
                            __.$root = _this;
                            __.provider = new Provider();
                            if (identifier) {
                                __.identifier = identifier;
                                __.provider.push(identifier, _this);
                            }
                        }
                        initPlugins(_this, provider.concat(injector).concat(plugins));
                    }
                    created && created.call(_this);
                    return _this;
                }
                return Vubx;
            }(constructor));
        };
    };
}
function initPlugins(ctx, plugin) {
    plugin.forEach(function (injector) { return injector(ctx); });
}
function proxyState(ctx, getterKeys) {
    var $state = ctx.__.$state;
    Object.keys(ctx).forEach(function (key) {
        if (getterKeys.indexOf(key) < 0) {
            def($state, key, { get: function () { return ctx[key]; }, enumerable: true });
        }
    });
}
function proxyGetters(ctx, vm, getterKeys) {
    var $getters = ctx.__.$getters;
    getterKeys.forEach(function (key) {
        def(ctx, key, {
            get: function () { return vm[key]; },
            set: function (value) { return vm[key] = value; },
            enumerable: true
        });
        def($getters, key, {
            get: function () { return ctx[key]; },
            set: function (value) { return ctx[key] = value; },
            enumerable: true
        });
    });
}
var vmMethods = ['$watch', '$on', '$once', '$emit', '$off', '$set', '$delete', '$destroy'];
function proxyMethod(ctx, vm) {
    var _loop_1 = function (key) {
        def(ctx, key, {
            get: function () { return vm[key].bind(vm); },
            enumerable: false
        });
    };
    for (var _i = 0, vmMethods_1 = vmMethods; _i < vmMethods_1.length; _i++) {
        var key = vmMethods_1[_i];
        _loop_1(key);
    }
}
function openStrict(vm, service) {
    if ("development" !== 'production') {
        vm.$watch(function () {
            return this.$data;
        }, function (val) {
            assert(service.__.isCommitting, 'Do not mutate vubx service data outside mutation handlers.');
        }, { deep: true, sync: true });
    }
}
function getPropertyGetters(target) {
    var getters = {};
    var keys = Object.getOwnPropertyNames(target);
    keys.forEach(function (key) {
        if (key === 'constructor') {
            return;
        }
        var descriptor = Object.getOwnPropertyDescriptor(target, key);
        if (descriptor.get && descriptor.enumerable) {
            getters[key] = {
                get: descriptor.get,
                set: descriptor.set
            };
        }
    });
    return getters;
}
function appendServiceChild(parent, childName, child, identifier) {
    parent.__.$children.push(child);
    if (child.__.$parent.indexOf(parent) <= -1) {
        child.__.$parent.push(parent);
    }
    if ("development" !== 'production') {
        assert(parent.__.$root, 'Make sure to have a root service, ' +
            'Please check the root options in the decorator configuration');
    }
    child.__.$root = parent.__.$root;
    child.__.identifier = identifier;
    parent.__.$getters[childName] = child.__.$getters;
    parent.__.$state[childName] = child.__.$state;
}

function mutation(target, mutationyKey, descriptor) {
    var mutationFn = descriptor.value;
    descriptor.value = function () {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        var middleware = this.__.middleware, vubxMutation = {
            type: this.__.identifier.toString() + ': ' + mutationyKey,
            payload: arg
        };
        var root = this.__.$root || this;
        var temp = root.__.isCommitting;
        root.__.isCommitting = true;
        var res;
        try {
            middleware.dispatchBefore(this, vubxMutation, this);
            res = mutationFn.apply(this, arg);
            middleware.dispatchAfter(this, vubxMutation, this);
        }
        finally {
            root.__.isCommitting = temp;
        }
        return res;
    };
    return descriptor;
}
function enumerable(value) {
    return function (target, propertyKey, descriptor) {
        descriptor.enumerable = value;
    };
}

exports.devtool = devtool;
exports.Service = Service;
exports.lazyInject = lazyInject;
exports.bindClass = bindClass;
exports.bindFactory = bindFactory;
exports.createDecorator = createDecorator;
exports.mutation = mutation;
exports.enumerable = enumerable;

Object.defineProperty(exports, '__esModule', { value: true });

})));
