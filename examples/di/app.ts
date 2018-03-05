import { Inject, State } from 'vue-class-state';
import { Component, Vue } from 'vue-property-decorator';
import { AppContainer, StateKeys, Store } from './store';

State.showInject();

@Component({
    template: '<div>{{store.text}}</div>'
})
class App extends Vue {

    @Inject(StateKeys.STORE) store: Store;

}

new Vue({
    el: '#app',
    // 在根组件实例化一个容器
    provide: new AppContainer(),
    render: (h) => h(App)
});
