import { expect } from 'chai';

// import Vue from 'vue/';
import { createDecorator, Service, IVubxDecorator, lazyInject, bind, IService } from '../../../lib/vubx';
const Vue = require('Vue');
const observable: IVubxDecorator = createDecorator(Vue);

describe('service $state $getters', function () {
    @observable()
    class State extends Service {
        a = 1;
        b = 2;
        get sum() {
            return this.a + this.b;
        }
        get diff() {
            return this.b = this.a;
        }
    }
    const state = new State();
    it('proxy $state', function () {
        expect(state.$state).to.deep.equal({ a: 1, b: 2 });
    });
    it('proxy $getters', function () {
        expect(state.$getters).to.have.all.keys('sum', 'diff');
        expect(state.$getters.sum).to.equal(3);
        expect(state.$getters.diff).to.equal(1);
    });
});

describe('service root', function () {
    const key = Symbol();
    @observable({
        root: true,
        identifier: key
    })
    class State extends Service {

    }
    const state = new State();
    const provider = state['__meta__'].provider;
    it('root service should has a provider', function () {
        expect(provider).to.be.ok;
    });
    it('provider proxy', function () {
        expect(provider.proxy[key]).to.equal(state);
    });
    it('provider get', function () {
        expect(provider.get(key)).to.equal(state);
    });
});

describe('computed', () => {

    it('getters proxy to vue computed', function () {
        const key = Symbol();
        let num = 0;
        @observable({
            root: true,
            identifier: key
        })
        class State extends Service {
            a = 1;
            get t() {
                num++;
                return this.a;
            }
        }
        const state = new State();

        state.t;
        state.t;
        state.t;
        state.a = 2;
        state.t;
        state.t;
        state.t;

        expect(num).eql(2);
    });

    it('get super getters', function () {

        let num = 0;

        const key = Symbol();
        class Base extends Service {
            get t() {
                num++;
                return '';
            }
        }

        @observable({
            root: true,
            identifier: key
        })
        class State extends Base {

        }
        const state = new State();

        state.t;
        state.t;
        state.t;
        state.t;
        state.t;

        expect(num).eql(1);
    });

    it('override super getters', function () {

        const key = Symbol();
        class Base extends Service {
            get t() {
                return 'super';
            }
        }

        @observable({
            root: true,
            identifier: key
        })
        class State extends Base {
            get t() {
                return 'child';
            }
        }
        const state = new State();

        expect(state.t).eql('child');
    });

});

describe('vubxMethods', () => {
    it('replaceState', () => {
        @observable()
        class State extends Service {
            a = 1;
            b = 2;
            obj = {};
            get jsonString() {
                return Object.assign({}, this, {
                    a: 3,
                    obj: {
                        c: 4
                    }
                });
            }
        }
        const state = new State();
        state.replaceState(state.jsonString);
        expect(state.$state).to.deep.equal({
            a: 3,
            b: 2,
            obj: {
                c: 4
            }
        });
    });

    it('replaceAllState', () => {
        const moduleKeys = {
            A: 'ModuleA',
            B: 'ModuleB',
            C: 'ModuleC'
        };

        interface IModule extends IService {
            text: string;
        }

        @observable()
        class ModuleA extends Service implements IModule {
            text = 'A';
        }

        @observable()
        class ModuleB extends Service implements IModule {
            text = 'B';
        }

        @observable()
        class ModuleC extends Service {

            @lazyInject(moduleKeys.A)
            moduleA: IModule;

            @lazyInject(moduleKeys.B)
            moduleB: IModule;
        }

        @observable({
            root: true,
            identifier: 'root',
            providers: [
                bind<IModule>(moduleKeys.A).toClass(ModuleA),
                bind<IModule>(moduleKeys.B).toClass(ModuleB),
                bind<ModuleC>(moduleKeys.C).toClass(ModuleC)
            ]
        })
        class Root extends Service {

            obj = {
                a: 'a',
                b: 1
            };

            @lazyInject(moduleKeys.A)
            public moduleA: IModule;

            @lazyInject(moduleKeys.B)
            public moduleB: IModule;

            @lazyInject(moduleKeys.C)
            public moduleC: ModuleC;

        }

        const rootModule = new Root();

        const targetState = Object.keys(moduleKeys)
            .reduce((state, key) => {
                return (state[moduleKeys[key]] = {
                    text: moduleKeys[key]
                }) && state;
            }, {});
        targetState['root'] = {
            obj: {
                a: 'b',
                b: 2
            }
        };
        rootModule.replaceAllState(targetState);

        expect(rootModule.moduleA.text).eql(moduleKeys.A);
        expect(rootModule.moduleB.text).eql(moduleKeys.B);
        expect(rootModule.obj).eql({
            a: 'b',
            b: 2
        });
        expect(rootModule.moduleC[moduleKeys.C]).eql(undefined);
        // todo test Symbol
    });

});
