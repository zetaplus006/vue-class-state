import { expect } from 'chai';

// import Vue from 'vue/';
import { createDecorator, Service, IVubxDecorator } from '../../../lib/vubx';
const Vue = require('Vue');
const observable: IVubxDecorator = createDecorator(Vue);

describe('service vue methods', function () {
    @observable({
        vueMethods: true
    })
    class TestVueMethods extends Service {

    }
    const testObj = new TestVueMethods();
    const vmMethods = ['$watch', '$on', '$once', '$emit', '$off', '$set', '$delete', '$destroy'];
    vmMethods.forEach(key => {
        it('[' + key + ']', function () {
            expect(testObj).to.has.property(key);
        });
    });
});

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
        expect(state.__.$state).to.deep.equal({ a: 1, b: 2 });
    });
    it('proxy $getters', function () {
        expect(state.__.$getters).to.have.all.keys('sum', 'diff');
        expect(state.__.$getters.sum).to.equal(3);
        expect(state.__.$getters.diff).to.equal(1);
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
    const provider = state.getProvider();
    it('root service should has a provider', function () {
        expect(provider).to.be.ok;
        expect(provider).to.equal(state.__.provider);
    });
    it('provider proxy', function () {
        expect(provider.proxy[key]).to.equal(state);
    });
    it('provider get', function () {
        expect(provider.get(key)).to.equal(state);
    });
});