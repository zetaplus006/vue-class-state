import {
    bind, Container,
    createDecorator, LazyInject, Mutation, State
} from 'vubx';
import { Component, Inject, Vue } from 'vue-property-decorator';
import { getter } from '../../src/state/observable';

const data = createDecorator(Vue);

const StateKeys = {
    A: 'moduleA',
    B: 'moduleB'
};

@data
class StateA {
    public text = 'A';

    @LazyInject(StateKeys.A)
    public me: StateB;

    @Mutation
    public change() {
        this.text = '';
    }
}

@data
class StateB {
    public text = 'B';
}

@Container({
    providers: [
        bind<StateA>(StateKeys.A).toClass(StateA),
        bind<StateB>(StateKeys.B).toClass(StateB)
    ],
    devtool: [StateKeys.A, StateKeys.B],
    strict: [StateKeys.A, StateKeys.B]
})
class AppContainer { }

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
    provide: new AppContainer(),
    render: (h) => h(App)
});

class Test {
    @State public a: number;
    @State public b = { b: 1 };
    @State public c = [1, 2];

    @getter get computed() {
        // tslint:disable
        console.log('computed');
        return this.a + '__computed';
    }
    constructor() {
        // setInterval(() => this.a++, 300);
        this.a = 1
    }
}

const o = new Test();
new Vue().$watch(() => o,
    (val) => alert(JSON.stringify(val)), { sync: true, deep: true })

console.log(o.computed);
console.log(o.computed);
console.log(o.computed);
o.a = 33;
console.log(o.computed);
console.log(o.computed);

console.log(o);
