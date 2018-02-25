import { expect } from 'chai';
import {
    bind, created, createDecorator, IService, IVubxDecorator,
    lazyInject, Service, StateModule
} from '../../../lib/vubx';

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

    it('lazyInject use propertyKey', () => {

        const moduleKeys = {
            A: 'moduleA',
            B: 'moduleB'
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
                bind<IModule>(moduleKeys.A).toClass(ModuleA),
                bind<IModule>(moduleKeys.B).toClass(ModuleB)
            ]
        })
        class Root extends Service {

            @lazyInject()
            public moduleA: IModule;

            @lazyInject
            public moduleB: IModule;

        }

        const rootModule = new Root();
        expect(rootModule.moduleA).to.be.ok;
        expect(rootModule.moduleB).to.be.ok;
        expect(rootModule.moduleA.text).eql('A');
        expect(rootModule.moduleB.text).eql('B');
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
            public text = 'A';
            public count = 0;

            @created()
            public created() {
                this.count++;
            }
        }

        @observable()
        class ModuleB extends Service implements IModule {
            public text = 'B';
            public count = 0;
            @created()
            public created() {
                this.count++;
            }
        }

        @observable()
        class ModuleC extends Service {

            @lazyInject(moduleKeys.A)
            public moduleA: IModule;

            @lazyInject(moduleKeys.B)
            public moduleB: IModule;

            @lazyInject('root')
            public rootModule: Root;

            public count = 0;

            @created()
            public created() {
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

            public count = 0;
            @created()
            public created() {
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
            public text = 'A';
            public count = 0;
            @created()
            public created() {
                this.count++;
            }
        }

        @observable()
        class ModuleC extends Service {

            @lazyInject(moduleKeys.A)
            public moduleA: IModule;

            @lazyInject(moduleKeys.B)
            public moduleB: IModule;

            @lazyInject('root')
            public rootModule: Root;

            public count = 0;
            @created()
            public created() {
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

            public count = 0;

            @created()
            public created() {
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
            public text = 'A';
            public count = 0;

            @created()
            public created() {
                this.count++;
            }
        }

        @observable()
        class ModuleC extends Service {

            @lazyInject(moduleKeys.A)
            public moduleA: IModule;

            @lazyInject(moduleKeys.B)
            public moduleB: IModule;

            @lazyInject('root')
            public rootModule: Root;

            public count = 0;

            @created()
            public created() {
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

            public count = 0;

            @created()
            public created() {
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

    it('created hook with deps', () => {
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
            public text = 'A';
            public count = 0;

            @created()
            public created() {
                this.count++;
            }
        }

        @observable()
        class ModuleC extends Service {

            @lazyInject(moduleKeys.A)
            public moduleA: IModule;

            @lazyInject(moduleKeys.B)
            public moduleB: IModule;

            @lazyInject('root')
            public rootModule: Root;

            public count = 0;

            @created()
            public created() {
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

            public moduleA2: IModule;

            public moduleB2: IModule;

            @created([moduleKeys.A, moduleKeys.B])
            public created(moduleA: any, moduleB: any) {
                this.moduleA2 = moduleA;
                this.moduleB2 = moduleB;
            }
        }

        const rootModule = new Root();
        expect(rootModule.moduleA === rootModule.moduleA2).eql(true);
        expect(rootModule.moduleB === rootModule.moduleB2).eql(true);
    });
});
