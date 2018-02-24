import {
    bind, createDecorator, IService, IVubxDecorator,
    Mutation, Service, StateModule
} from 'vubx';
import { Component, Inject, Vue } from 'vue-property-decorator';

const state: IVubxDecorator = createDecorator(Vue);

const StateKeys = {
    A: 'moduleA',
    B: 'moduleB'
};

interface IState extends IService {
    text: string;
}

@state()
class StateA extends Service implements IState {
    public text = 'A';

    @Mutation
    public change () {
        this.text = '';
    }
}

// tslint:disable-next-line:max-classes-per-file
@state()
class StateB extends Service implements IState {
    public text = 'B';
}

// tslint:disable-next-line:max-classes-per-file
@StateModule({
    providers: [
        bind<IState>(StateKeys.A).toClass(StateA),
        bind<IState>(StateKeys.B).toClass(StateB)
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
    public moduleB: IState;

    get text () {
        return this.moduleA.text + this.moduleB.text;
    }

    get a () {
        return this.moduleA;
    }

    public mounted () {
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
