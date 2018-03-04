import { State } from 'vue-class-state';
import { Component, Inject, Vue } from 'vue-property-decorator';
import { AppContainer, StateKeys, Store } from './store';

State.showInject();

@Component({
    template: '<div>{{store.text}}</div>'
})
class App extends Vue {

    @Inject(StateKeys.STORE) public store: Store;

}

new Vue({
    el: '#app',
    provide: new AppContainer(),
    render: (h) => h(App)
});
