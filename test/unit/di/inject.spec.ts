import { expect } from 'chai';
import {
    bind, created, createDecorator, IService, Ivue-class - stateDecorator,
    lazyInject, Service, StateModule;
} from; '../../../lib/vue-class-state';

const Vue = require('Vue');

const observable: Ivue -class - stateDecorator = createDecorator (Vue);

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
            public text = 'A';
        }

        @observable()
        class ModuleB extends Service implements IModule {
            public text = 'B';
        }

        @StateModule({
            providers: [
                bind<IModule>(moduleKeys.A).toClass(ModuleA),
                bind<IModule>(moduleKeys.B).toClass(ModuleB)
            ]
        })
        class Root { }

        const rootModule = new Root();
        expect(rootModule.moduleA.text).eql('A');
        expect(rootModule.moduleB.text).eql('B');
    });

    it('simple class inject', () => {

        const moduleKeys = {
            A: 'ModuleA',
            B: 'ModuleB',
            C: 'ModuleC'
        };

        class ModuleA {
            public text = 'A';
        }

        @observable()
        class ModuleC extends Service {
            public text = 'C';
        }

        class ModuleB {
            public text = 'B';

            @lazyInject(moduleKeys.C)
            public moduleC: ModuleC;
        }

        @observable({
            providers: [
                bind<ModuleA>(moduleKeys.A).toClass(ModuleA),
                bind<ModuleB>(moduleKeys.B).toClass(ModuleB),
                bind<ModuleC>(moduleKeys.C).toClass(ModuleC)
            ]
        })
        class Root extends Service {

            @lazyInject(moduleKeys.A)
            public moduleA: ModuleA;

            @lazyInject(moduleKeys.B)
            public moduleB: ModuleB;

        }

        const rootModule = new Root();
        expect(rootModule.moduleA).to.be.ok;
        expect(rootModule.moduleB).to.be.ok;
        expect(rootModule.moduleB.moduleC).to.be.ok;
        expect(rootModule.moduleA.text).eql('A');
        expect(rootModule.moduleB.text).eql('B');
        expect(rootModule.moduleB.moduleC.text).eql('C');
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
            public text = 'A';
        }

        const value = new ModuleA();

        @observable({
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
        expect(rootModule.moduleA === rootModule.moduleB).eql(true);
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
            public text = 'A';
        }

        @observable()
        class ModuleB extends Service implements IModule {
            public text = 'B';
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
        expect(rootModule.moduleA.text).eql('A');
        expect(rootModule.moduleB.text).eql('B');
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
            public text = 'A';
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
        expect(rootModule.moduleA === rootModule.moduleB).eql(true);
    });

    it('inject in deep struct', () => {

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
            public text = 'A';
        }

        @observable()
        class ModuleB extends Service implements IModule {
            public text = 'B';
        }

        @observable()
        class ModuleC extends Service {

            @lazyInject(moduleKeys.A)
            public moduleA: IModule;

            @lazyInject(moduleKeys.B)
            public moduleB: IModule;
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

            @lazyInject(moduleKeys.A)
            public moduleA: IModule;

            @lazyInject(moduleKeys.B)
            public moduleB: IModule;

            @lazyInject(moduleKeys.C)
            public moduleC: ModuleC;

        }

        const rootModule = new Root();
        expect(rootModule.moduleC.moduleA === rootModule.moduleA).eql(true);
        expect(rootModule.moduleC.moduleB === rootModule.moduleB).eql(true);
    });

});
