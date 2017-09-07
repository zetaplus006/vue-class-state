import { expect } from 'chai';
import { createDecorator, Service, IService, bind, lazyInject, IVubxDecorator } from '../../../lib/vubx';
const Vue = require('Vue');

const observable: IVubxDecorator = createDecorator(Vue);

describe('di', () => {

    it('class inject', () => {

        const moduleKeys = {
            A: 'ModuleA',
            B: 'ModuleB'
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

        @observable({
            root: true,
            identifier: 'root',
            providers: [
                bind<IModule>(moduleKeys.A).toClass(ModuleA),
                bind<IModule>(moduleKeys.B).toClass(ModuleB)
            ]
        })
        class Root extends Service {

            @lazyInject(moduleKeys.A)
            public moduleA: IModule;

            @lazyInject(moduleKeys.B)
            public moduleB: IModule;

        }

        const rootModule = new Root();
        expect(rootModule.moduleA).to.be.ok;
        expect(rootModule.moduleB).to.be.ok;
        expect(rootModule.moduleA.text).to.equal('A');
        expect(rootModule.moduleB.text).to.equal('B');
    });

    it('value inject', () => {
        const moduleKeys = {
            A: 'ModuleA',
            B: 'ModuleB'
        };

        interface IModule extends IService {
            text: string;
        }

        @observable()
        class ModuleA extends Service implements IModule {
            text = 'A';
        }

        const value = new ModuleA();

        @observable({
            root: true,
            identifier: 'root',
            providers: [
                bind<IModule>(moduleKeys.A).toValue(value),
                bind<IModule>(moduleKeys.B).toValue(value)
            ]
        })
        class Root extends Service {

            @lazyInject(moduleKeys.A)
            public moduleA: IModule;

            @lazyInject(moduleKeys.B)
            public moduleB: IModule;

        }

        const rootModule = new Root();
        expect(rootModule.moduleA).to.be.ok;
        expect(rootModule.moduleB).to.be.ok;
        expect(rootModule.moduleA).to.equal(rootModule.moduleB);
    });

    it('factory inject', () => {

        const moduleKeys = {
            A: 'ModuleA',
            B: 'ModuleB'
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

        @observable({
            root: true,
            identifier: 'root',
            providers: [
                bind<IModule>(moduleKeys.A).toFactory(() => new ModuleA()),
                bind<IModule>(moduleKeys.B).toFactory(() => new ModuleB())
            ]
        })
        class Root extends Service {

            @lazyInject(moduleKeys.A)
            public moduleA: IModule;

            @lazyInject(moduleKeys.B)
            public moduleB: IModule;

        }

        const rootModule = new Root();
        expect(rootModule.moduleA).to.be.ok;
        expect(rootModule.moduleB).to.be.ok;
        expect(rootModule.moduleA.text).to.equal('A');
        expect(rootModule.moduleB.text).to.equal('B');
    });

    it('factory inject with deps', () => {

        const moduleKeys = {
            A: 'ModuleA',
            B: 'ModuleB'
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

        @observable({
            root: true,
            identifier: 'root',
            providers: [
                bind<IModule>(moduleKeys.A).toFactory(() => new ModuleA()),
                bind<IModule>(moduleKeys.B).toFactory((moduleA: IModule) => moduleA, [moduleKeys.A])
            ]
        })
        class Root extends Service {

            @lazyInject(moduleKeys.A)
            public moduleA: IModule;

            @lazyInject(moduleKeys.B)
            public moduleB: IModule;

        }

        const rootModule = new Root();
        expect(rootModule.moduleA).to.be.ok;
        expect(rootModule.moduleB).to.be.ok;
        expect(rootModule.moduleA).to.equal(rootModule.moduleB);
    });

    it('inSingletonScope', () => {
        const moduleKeys = {
            A: 'ModuleA'
        };

        interface IModule extends IService {
            text: string;
        }

        @observable()
        class ModuleA extends Service implements IModule {
            text = 'A';
        }

        @observable({
            root: true,
            identifier: 'root',
            providers: [
                bind<IModule>(moduleKeys.A).toClass(ModuleA).inSingletonScope()
            ]
        })
        class Root extends Service {

            @lazyInject(moduleKeys.A)
            public moduleA: IModule;

            @lazyInject(moduleKeys.A)
            public moduleB: IModule;

        }

        const rootModule = new Root();
        expect(rootModule.moduleA).to.be.ok;
        expect(rootModule.moduleB).to.be.ok;
        expect(rootModule.moduleA).to.equal(rootModule.moduleB);
    });

    it('inTransientScope', () => {
        const moduleKeys = {
            A: 'ModuleA'
        };

        interface IModule extends IService {
            text: string;
        }

        @observable()
        class ModuleA extends Service implements IModule {
            text = 'A';
        }

        @observable({
            root: true,
            identifier: 'root',
            providers: [
                bind<IModule>(moduleKeys.A).toClass(ModuleA).inTransientScope()
            ]
        })
        class Root extends Service {

            @lazyInject(moduleKeys.A)
            public moduleA: IModule;

            @lazyInject(moduleKeys.A)
            public moduleB: IModule;

        }

        const rootModule = new Root();
        expect(rootModule.moduleA).to.be.ok;
        expect(rootModule.moduleB).to.be.ok;
        expect(rootModule.moduleA).to.not.equal(rootModule.moduleB);
    });
});