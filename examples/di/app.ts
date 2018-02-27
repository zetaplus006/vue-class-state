import { Component, Inject, Vue } from 'vue-property-decorator';
import { AppContainer, StateA, StateB, StateKeys } from './store';

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
