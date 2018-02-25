import {
    bind, createDecorator,
    Mutation, StateModule
} from 'vubx';
import { Component, Inject, Vue } from 'vue-property-decorator';

const state = createDecorator(Vue);

const StateKeys = {
    A: 'moduleA',
    B: 'moduleB'
};

@state
class StateA {
    public text = 'A';

    @Mutation
    public change() {
        this.text = '';
    }
}

@state
class StateB {
    public text = 'B';
}

@StateModule({
    providers: [
        bind<StateA>(StateKeys.A).toClass(StateA),
        bind<StateB>(StateKeys.B).toClass(StateB)
    ],
    devtool: [StateKeys.A, StateKeys.B],
    strict: [StateKeys.A, StateKeys.B]
})
class AppModule { }

// tslint:disable-next-line:max-classes-per-file
@Component({
    template: '<div>{{text}}</div>'
})
class App extends Vue {

    @Inject(StateKeys.A)
    public moduleA: StateA;

    @Inject(StateKeys.B)
    public moduleB: StateB;

    get text() {
        return this.moduleA.text + this.moduleB.text;
    }

    get a() {
        return this.moduleA;
    }

    public mounted() {
        setTimeout(() => {
            this.moduleA.change();
        }, 2000);
    }
}

new Vue({
    el: '#app',
    provide: new AppModule(),
    render: (h) => h(App)
});
