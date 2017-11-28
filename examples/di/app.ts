import Vue from 'vue';
import { createDecorator, Service, mutation, lazyInject, bind, IService, created } from 'vubx';
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

    @lazyInject
    public moduleA: IModule;

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
    ],
    strict: true,
    devtool: true
})
class Root extends Service {

    @lazyInject(moduleKeys.A)
    public moduleA: IModule;

    @lazyInject(moduleKeys.B)
    public moduleB: IModule;

    child: IModule;

    get text() {
        return this.moduleA.text + this.moduleB.text;
    }

    @created([moduleKeys.A])
    created(moduleA: IModule) {
        this.injectService(moduleA, 'child', 'child');
        console.log(this.child === this.moduleA);
    }

}

const rootModule = new Root();
console.log(rootModule);

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

    get text() {
        return this.moduleA.text + this.moduleB.text;
    }
}

new Vue({
    el: '#app',
    provide: rootModule.getProvide(),
    render: h => h(App)
});