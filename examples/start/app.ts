import Vue from 'vue';
import { createDecorator, Service, mutation, lazyInject, bind, IService } from 'vubx';

const observable = createDecorator(Vue);

@observable({
    root: true,
    identifier: Symbol('counter'),
    // 开启严格模式，类实例中数据只能在打了@mutation注解的类方法中修改
    strict: true,
    // 使该实例能被vue的devtool观察到
    devtool: true
})
class Addition extends Service {

    // 类中的数据在初始化后会被Vue观察到
    a = 0;
    b = 1;

    // 本类中的getter 都会代理为Vue的计算属性
    get sum() {
        return this.a + this.b;
    }

    // 突变方法，与vuex一致必须为同步函数
    @mutation
    change() {
        const temp = this.sum;
        this.a = this.b;
        this.b = temp;
    }

}

const addition = new Addition();

new Vue({
    el: '#app',
    template: `<div>{{addition.sum}}</div>`,
    computed: {
        addition() {
            return addition;
        }
    },
    mounted() {
        setInterval(() => {
            addition.change();
        }, 2000);
    }
});

const moduleKeys = {
    A: 'ModuleA',
    B: 'ModuleB',
    C: 'ModuleC'
};

interface IModule extends IService {
    text: string;
}

@observable()
class ModuleA extends Service implements IModule {
    text = 'A';
}

@observable()
class ModuleB extends Service implements IModule {
    text = 'B';
}

@observable()
class ModuleC extends Service {

    @lazyInject(moduleKeys.A)
    moduleA: IModule;

    @lazyInject(moduleKeys.B)
    moduleB: IModule;
}

@observable({
    root: true,
    identifier: 'root',
    providers: [
        bind<IModule>(moduleKeys.A).toClass(ModuleA),
        bind<IModule>(moduleKeys.B).toClass(ModuleB),
        bind<ModuleC>(moduleKeys.C).toClass(ModuleC)
    ]
})
class Root extends Service {

    obj = {
        a: 'a',
        b: 1
    };

    @lazyInject(moduleKeys.A)
    public moduleA: IModule;

    @lazyInject(moduleKeys.B)
    public moduleB: IModule;

    @lazyInject(moduleKeys.C)
    public moduleC: ModuleC;

}

const rootModule = new Root();

const targetState = Object.keys(moduleKeys)
    .reduce((state, key) => {
        return (state[moduleKeys[key]] = {
            text: moduleKeys[key]
        }) && state;
    }, {});
console.log(targetState);
targetState['root'] = {
    obj: {
        a: 'b',
        b: 2
    }
};
rootModule.replaceAllState(targetState);
console.log(rootModule);
