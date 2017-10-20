import Vue from 'vue';
import { createDecorator, Service, mutation, lazyInject, bind, IService } from 'vubx';
import component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';

const observable = createDecorator(Vue);

const moduleKeys = {
    root: 'root',
    A: 'moduleA',
    B: 'moduleB'
};

interface IModule extends IService {
    text: string;
}

@observable()
class ModuleA extends Service implements IModule {
    text = 'A';

    @lazyInject(moduleKeys.A)
    public moduleA: IModule;

    get AA() {
        return 'Aa';
    }
}

@observable()
class ModuleB extends Service implements IModule {
    text = 'B';
}

@observable({
    root: true,
    identifier: moduleKeys.root,
    providers: [
        bind<IModule>(moduleKeys.A).toClass(ModuleA),
        bind<IModule>(moduleKeys.B).toClass(ModuleB)
    ]
})
class Root extends Service {

    aa = { ss: 's' };

    @lazyInject(moduleKeys.A)
    public moduleA: IModule;

    @lazyInject(moduleKeys.B)
    public moduleB: IModule;

    get text() {
        return this.moduleA.text + this.moduleB.text;
    }

}

const rootModule = new Root().useDevtool().useStrict();

@component({
    template: '<div>{{text}}</div>',
    inject: {
        moduleA: moduleKeys.A,
        moduleB: moduleKeys.B
    }
})
class App extends Vue {

    moduleA: IModule;
    moduleB: IModule;

    /*  @Inject(moduleKeys.A)
     moduleA: IModule;

     @Inject(moduleKeys.B)
     moduleB: IModule; */

    /*    @Inject()
       moduleA: IModule;
       @Inject()
       moduleB: IModule; */

    get text() {
        return this.moduleA.text + this.moduleB.text;
    }
}

new Vue({
    el: '#app',
    provide: rootModule.getProvide(),
    render: h => h(App)
});