import { Component, Inject, Vue } from 'vue-property-decorator';
import { AppContainer, StateKeys, Store } from './store';

@Component({
    template: '<div>{{store.text}}</div>'
})
class App extends Vue {

    @Inject(StateKeys.STORE)
    public store: Store;

    get _store() {
        return this.store;
    }

}

new Vue({
    el: '#app',
    provide: new AppContainer(),
    render: (h) => h(App)
});
