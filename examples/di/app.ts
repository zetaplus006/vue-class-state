import Vue from 'vue';
import { createDecorator, Service, mutation, lazyInject, bind, IService, created, IVubxDecorator, StateModule } from 'vubx';
import component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { devtool } from '../../src/plugins/devtool';

const observable: IVubxDecorator = createDecorator(Vue);

const moduleKeys = {
    A: 'moduleA',
    B: 'moduleB'
};

interface IModule extends IService {
    text: string;
}

@observable()
class ModuleA extends Service implements IModule {
    text = 'A';

    @mutation
    change() {
        this.text = '';
    }

}

@observable()
class ModuleB extends Service implements IModule {
    text = 'B';
}

const rootModule = new StateModule({
    providers: [
        bind<IModule>(moduleKeys.A).toClass(ModuleA),
        bind<IModule>(moduleKeys.B).toClass(ModuleB)
    ],
    devtool: [moduleKeys.A, moduleKeys.B],
    strict: [moduleKeys.A, moduleKeys.B]
});

@component({
    template: '<div>{{text}}</div>',
    inject: {
        moduleA: moduleKeys.A,
        moduleB: moduleKeys.B
    }
})
class App extends Vue {

    moduleA: ModuleA;
    moduleB: IModule;

    get text() {
        return this.moduleA.text + this.moduleB.text;
    }

    get a() {
        return this.moduleA;
    }

    mounted() {
        console.log(this.moduleA);
        setTimeout(() => {
            this.moduleA.change();
        }, 2000);

    }
}

new Vue({
    el: '#app',
    provide: rootModule,
    render: h => h(App)
});
