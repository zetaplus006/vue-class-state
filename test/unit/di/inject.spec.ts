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
        expect(rootModule.moduleA.text).eql('A');
        expect(rootModule.moduleB.text).eql('B');
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
        expect(rootModule.moduleA === rootModule.moduleB).eql(true);
    });

    it('inSingletonScope', () => {

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

        @observable({
            root: true,
            identifier: 'root',
            providers: [
                bind<IModule>(moduleKeys.A).toClass(ModuleA).inSingletonScope(),
                bind<IModule>(moduleKeys.B).toFactory(() => new ModuleA()).inSingletonScope()
            ]
        })
        class Root extends Service {

            @lazyInject(moduleKeys.A)
            public moduleA1: IModule;

            @lazyInject(moduleKeys.A)
            public moduleA2: IModule;

            @lazyInject(moduleKeys.B)
            public moduleB1: IModule;

            @lazyInject(moduleKeys.B)
            public moduleB2: IModule;

        }

        const rootModule = new Root();

        expect(rootModule.moduleA1 === rootModule.moduleA2).eql(true);
        expect(rootModule.moduleB1 === rootModule.moduleB2).eql(true);

    });

    it('inTransientScope', () => {
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

        @observable({
            root: true,
            identifier: 'root',
            providers: [
                bind<IModule>(moduleKeys.A).toClass(ModuleA).inTransientScope(),
                bind<IModule>(moduleKeys.B).toFactory(() => new ModuleA()).inTransientScope()
            ]
        })
        class Root extends Service {

            @lazyInject(moduleKeys.A)
            public moduleA1: IModule;

            @lazyInject(moduleKeys.A)
            public moduleA2: IModule;

            @lazyInject(moduleKeys.B)
            public moduleB1: IModule;

            @lazyInject(moduleKeys.B)
            public moduleB2: IModule;

        }

        const rootModule = new Root();
        expect(rootModule.moduleA1 === rootModule.moduleA2).eql(false);
        expect(rootModule.moduleB1 === rootModule.moduleB2).eql(false);

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

    it('created hook should run once in class injector', () => {
        const moduleKeys = {
            A: 'ModuleA',
            B: 'ModuleB',
            C: 'ModuleC'
        };

        interface IModule extends IService {
            text: string;
            count: number;
        }

        @observable()
        class ModuleA extends Service implements IModule {
            text = 'A';
            count = 0;
            created() {
                this.count++;
            }
        }

        @observable()
        class ModuleB extends Service implements IModule {
            text = 'B';
            count = 0;
            created() {
                this.count++;
            }
        }

        @observable()
        class ModuleC extends Service {

            @lazyInject(moduleKeys.A)
            moduleA: IModule;

            @lazyInject(moduleKeys.B)
            moduleB: IModule;

            @lazyInject('root')
            rootModule: Root;

            count = 0;
            created() {
                this.count++;
            }
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

            count = 0;
            created() {
                this.count++;
            }

        }

        const rootModule = new Root();
        rootModule.moduleA;
        rootModule.moduleA;
        rootModule.moduleB;
        rootModule.moduleB;
        rootModule.moduleC;
        rootModule.moduleC.moduleA;
        rootModule.moduleC.moduleB;
        rootModule.moduleC.rootModule;

        expect(rootModule.count).eql(1);
        expect(rootModule.moduleA.count).eql(1);
        expect(rootModule.moduleB.count).eql(1);
        expect(rootModule.moduleC.count).eql(1);

    });

    it('created hook should run once in value injector', () => {
        const moduleKeys = {
            A: 'ModuleA',
            B: 'ModuleB',
            C: 'ModuleC'
        };

        interface IModule extends IService {
            text: string;
            count: number;
        }

        @observable()
        class ModuleA extends Service implements IModule {
            text = 'A';
            count = 0;
            created() {
                this.count++;
            }
        }

        @observable()
        class ModuleB extends Service implements IModule {
            text = 'B';
            count = 0;
            created() {
                this.count++;
            }
        }

        @observable()
        class ModuleC extends Service {

            @lazyInject(moduleKeys.A)
            moduleA: IModule;

            @lazyInject(moduleKeys.B)
            moduleB: IModule;

            @lazyInject('root')
            rootModule: Root;

            count = 0;
            created() {
                this.count++;
            }
        }

        const Value = new ModuleA();

        @observable({
            root: true,
            identifier: 'root',
            providers: [
                bind<IModule>(moduleKeys.A).toValue(Value),
                bind<IModule>(moduleKeys.B).toValue(Value),
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

            count = 0;
            created() {
                this.count++;
            }

        }

        const rootModule = new Root();
        rootModule.moduleA;
        rootModule.moduleA;
        rootModule.moduleB;
        rootModule.moduleB;
        rootModule.moduleC;
        rootModule.moduleC.moduleA;
        rootModule.moduleC.moduleB;
        rootModule.moduleC.rootModule;

        expect(rootModule.count).eql(1);
        expect(rootModule.moduleA.count).eql(1);
        expect(rootModule.moduleB.count).eql(1);
        expect(rootModule.moduleC.count).eql(1);

    });

    it('created hook should run once in factory injector', () => {
        const moduleKeys = {
            A: 'ModuleA',
            B: 'ModuleB',
            C: 'ModuleC'
        };

        interface IModule extends IService {
            text: string;
            count: number;
        }

        @observable()
        class ModuleA extends Service implements IModule {
            text = 'A';
            count = 0;
            created() {
                this.count++;
            }
        }

        @observable()
        class ModuleB extends Service implements IModule {
            text = 'B';
            count = 0;
            created() {
                this.count++;
            }
        }

        @observable()
        class ModuleC extends Service {

            @lazyInject(moduleKeys.A)
            moduleA: IModule;

            @lazyInject(moduleKeys.B)
            moduleB: IModule;

            @lazyInject('root')
            rootModule: Root;

            count = 0;
            created() {
                this.count++;
            }
        }

        const Value = new ModuleA();

        @observable({
            root: true,
            identifier: 'root',
            providers: [
                bind<IModule>(moduleKeys.A).toFactory(() => Value),
                bind<IModule>(moduleKeys.B).toFactory((m: IModule) => m, [moduleKeys.A]),
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

            count = 0;
            created() {
                this.count++;
            }

        }

        const rootModule = new Root();
        rootModule.moduleA;
        rootModule.moduleA;
        rootModule.moduleB;
        rootModule.moduleB;
        rootModule.moduleC;
        rootModule.moduleC.moduleA;
        rootModule.moduleC.moduleB;
        rootModule.moduleC.rootModule;

        expect(rootModule.count).eql(1);
        expect(rootModule.moduleA.count).eql(1);
        expect(rootModule.moduleB.count).eql(1);
        expect(rootModule.moduleC.count).eql(1);

    });

});