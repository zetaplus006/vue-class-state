import {
    bind, Container,
    Getter, Inject as Inject, Mutation, State
} from 'vue-class-state';

export const StateKeys = {
    A: 'moduleA',
    B: 'moduleB'
};

export class StateA {
    @State public text = 'A';

    @Inject(StateKeys.A) public me: StateB;

    @Getter get computed() {
        return this.text + '__computed';
    }

    constructor(
        @Inject(StateKeys.B) public stateB: StateB,
        @Inject(StateKeys.B) public stateB2: StateB
    ) {
        // tslint:disable-next-line:no-console
        console.log(arguments);
        // tslint:disable-next-line:no-console
        console.log(this);
    }

    @Mutation
    public change() {
        this.text = '';
    }
}

export class StateB {
    @State public text = 'B';
}

@Container({
    providers: [
        bind<StateA>(StateKeys.A).toClass(StateA),
        bind<StateB>(StateKeys.B).toClass(StateB)
    ],
    devtool: [StateKeys.A, StateKeys.B],
    strict: [StateKeys.A, StateKeys.B]
})
export class AppContainer { }
