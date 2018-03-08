import Vue from 'vue';
import Component from 'vue-class-component';
import { Inject, State } from 'vue-class-state';
import { AppContainer, StateKeys, Store } from './store';

State.showInject();

@Component({
    template: '<div>{{store.text}}</div>'
})
class App extends Vue {

    // 根据注入标识在子组件中注入实例
    @Inject(StateKeys.STORE) store: Store;

}

new Vue({
    el: '#app',
    // 在根组件实例化一个容器，传入到provide选项
    provide: new AppContainer(),
    render: (h) => h(App)
});
