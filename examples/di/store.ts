import {
    bind, Container, Getter, Inject, State
} from 'vue-class-state';

export const StateKeys = {
    A: 'stateA',
    B: 'stateB',
    STORE: 'store'
};

export class StateA {
    @State public text = 'A';
}

export class StateB {
    @State public text = 'B';
}

export class Store {

    // @State public a = 0;
    constructor(
        @Inject(StateKeys.A) public stateA: StateA,
        @Inject(StateKeys.B) public stateB: StateB
    ) {
    }

    @Getter get text() {
        return this.stateA.text + this.stateB.text;
    }

}

@Container({
    providers: [
        bind<StateA>(StateKeys.A).toClass(StateA),
        bind<StateB>(StateKeys.B).toClass(StateB),
        bind<Store>(StateKeys.STORE).toClass(Store)
    ],
    devtool: [StateKeys.A, StateKeys.B, StateKeys.STORE],
    strict: [StateKeys.A, StateKeys.B, StateKeys.STORE]
})
export class AppContainer { }
