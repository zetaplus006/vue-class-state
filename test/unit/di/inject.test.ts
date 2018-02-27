import test from 'ava';
import { bind, Container, Getter, Inject, Mutation, State } from '../../../lib/vue-class-state';

test('class inject', t => {
    const KEYS = {
        A: 'A',
        B: 'B',
        ROOT: 'ROOT'
    };

    interface IModule {
        text: string;
    }

    class StateA implements IModule {
        public text = 'A';
    }

    class StateB implements IModule {
        public text = 'B';
    }

    class Root {
        @Inject(KEYS.A) public stateA: IModule;
        @Inject(KEYS.B) public stateB: IModule;

        constructor(
            @Inject(KEYS.A) public paramA: IModule,
            @Inject(KEYS.B) public paramB: IModule
        ) {

        }
    }

    @Container({
        providers: [
            bind<IModule>(KEYS.A).toClass(StateA),
            bind<IModule>(KEYS.B).toClass(StateB),
            bind<Root>(KEYS.ROOT).toClass(Root)
        ]
    })
    class Store { }

    const root = new Store()[KEYS.ROOT] as Root;

    t.true(root instanceof Root);
    t.is(root.paramA, root.stateA);
    t.is(root.paramB, root.stateB);
    t.is(root.paramA.text, 'A');
    t.is(root.paramB.text, 'B');
});

test('value inject', t => {
    const KEYS = {
        A: 'A',
        B: 'B',
        ROOT: 'ROOT'
    };

    interface IModule {
        text: string;
    }

    class StateA implements IModule {
        public text = 'A';
    }

    class StateB implements IModule {
        public text = 'B';
    }

    class Root {
        @Inject(KEYS.A) public stateA: IModule;
        @Inject(KEYS.B) public stateB: IModule;

        constructor(
            @Inject(KEYS.A) public paramA: IModule,
            @Inject(KEYS.B) public paramB: IModule
        ) {

        }
    }

    @Container({
        providers: [
            bind<IModule>(KEYS.A).toValue(new StateA()),
            bind<IModule>(KEYS.B).toValue(new StateB()),
            bind<Root>(KEYS.ROOT).toClass(Root)
        ]
    })
    class Store { }

    const root = new Store()[KEYS.ROOT] as Root;

    t.true(root instanceof Root);
    t.is(root.paramA, root.stateA);
    t.is(root.paramB, root.stateB);
    t.is(root.paramA.text, 'A');
    t.is(root.paramB.text, 'B');
});

test('factory inject', t => {
    const KEYS = {
        A: 'A',
        B: 'B',
        ROOT: 'ROOT'
    };

    interface IModule {
        text: string;
    }

    class StateA implements IModule {
        public text = 'A';
    }

    class StateB implements IModule {
        public text = 'B';
    }

    class Root {
        @Inject(KEYS.A) public stateA: IModule;
        @Inject(KEYS.B) public stateB: IModule;

        constructor(
            @Inject(KEYS.A) public paramA: IModule,
            @Inject(KEYS.B) public paramB: IModule
        ) {

        }
    }
    const valueA = new StateA(), valueB = new StateB();
    @Container({
        providers: [
            bind<IModule>(KEYS.A).toFactory(() => valueA),
            bind<IModule>(KEYS.B).toFactory(() => valueB),
            bind<Root>(KEYS.ROOT).toClass(Root)
        ]
    })
    class Store { }

    const root = new Store()[KEYS.ROOT] as Root;

    t.true(root instanceof Root);
    t.is(root.paramA, root.stateA);
    t.is(root.paramB, root.stateB);
    t.is(root.paramA, valueA);
    t.is(root.paramB, valueB);
    t.is(root.paramA.text, 'A');
    t.is(root.paramB.text, 'B');
});

test('factory inject', t => {
    const KEYS = {
        A: 'A',
        B: 'B',
        ROOT: 'ROOT'
    };

    interface IModule {
        text: string;
    }

    class StateA implements IModule {
        public text = 'A';
    }

    class StateB implements IModule {
        public text = 'B';
    }

    class Root {
        @Inject(KEYS.A) public stateA: IModule;
        @Inject(KEYS.B) public stateB: IModule;

        constructor(
            @Inject(KEYS.A) public paramA: IModule,
            @Inject(KEYS.B) public paramB: IModule
        ) {

        }
    }
    @Container({
        providers: [
            bind<IModule>(KEYS.A).toFactory(() => new StateA()),
            bind<IModule>(KEYS.B).toFactory((depA: IModule) => depA, [KEYS.A]),
            bind<Root>(KEYS.ROOT).toClass(Root)
        ]
    })
    class Store { }

    const root = new Store()[KEYS.ROOT] as Root;

    t.true(root instanceof Root);
    t.is(root.paramA, root.paramB);
    t.is(root.paramA, root.stateA);
    t.is(root.paramB, root.stateB);
    t.is(root.paramA.text, 'A');
    t.is(root.paramB.text, root.paramB.text);
});
