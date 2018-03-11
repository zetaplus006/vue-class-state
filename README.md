## vue-class-state
> Vue状态管理，灵感来自[mobx](https://github.com/mobxjs/mobx)

`vue-class-state`提供以下功能：

1.`state`、`getters`、`mutation`，其概念与`vuex`基本相通，区别是vue-class-state是以class(类)和decorator(装饰器)的形式来实现的。

2.简单的依赖注入，用于解决子模块之间共享数据的问题,此功能不仅能在状态管理中使用，也可与Vue的[provide/inject](https://cn.vuejs.org/v2/api/#provide-inject)配合使用。(此功能主要参考[InversifyJS](https://github.com/inversify/InversifyJS)的api设计)

3.支持严格模式，开启后`state`只能在`mutation`中被修改，支持拦截mutation。

4.支持`vue`官方devtool,可以在devtool的vuex标签下查看`state`、`getters`、`mutation`。

## 安装

```bash
npm install vue vue-class-state --save
```

注意:

1.TypeScript用户需要开启tsconfig.json中的`experimentalDecorators`和`allowSyntheticDefaultImports`的编译选项

2.javaScript+Babel用户需要[babel-plugin-transform-decorators-legacy](babel-plugin-transform-decorators-legacy)和[babel-plugin-transform-class-properties](https://babeljs.io/docs/plugins/transform-class-properties/)插件。

<!-- 3.需要支持[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)的运行环境 -->

## 基本使用

``` typescript
// store.ts

import { bind, Container, Getter, Inject, State } from 'vue-class-state';

// 定义注入标识
export const StateKeys = {
    A: 'stateA',
    B: 'stateB',
    STORE: 'store'
};

export class StateA {
    // 定义可观察数据
    @State text = 'A';
}

export class StateB {
    @State text = 'B';
}

export class Store {

    // 根据注入标识在将实例注入到类实例属性中
    // 并且在第一次读取该属性时才进行初始化
    // @Inject(StateKeys.A)  stateA!: StateA

    constructor(
        // 根据注入标识在将实例注入到构造器参数中
        @Inject(StateKeys.A) public stateA: StateA,
        @Inject(StateKeys.B) public stateB: StateB
    ) {
    }

    // 定义计算属性,
    // 并且在第一次读取该属性时才进行该计算属性的初始化
    @Getter get text() {
        return this.stateA.text + this.stateB.text;
    }

}

// 定义容器
@Container({
    providers: [
        // 绑定注入规则，一个标识对应一个类实例（容器范围内单例注入）
        bind<StateA>(StateKeys.A).toClass(StateA),
        bind<StateB>(StateKeys.B).toClass(StateB),
        bind<Store>(StateKeys.STORE).toClass(Store)
    ],
    // 开启严格模式
    strict: true
})
export class AppContainer { }
```

``` typescript
// app.ts

import Vue from 'vue';
import Component from 'vue-class-component';
import { Inject } from 'vue-class-state';
import { AppContainer, StateKeys, Store } from './store';

// 推荐使用vue官方的vue-class-component库
@Component({
    template: '<div>{{store.text}}</div>'
})
class App extends Vue {

    // 根据注入标识在子组件中注入实例
    @Inject(StateKeys.STORE) store!: Store;

}

new Vue({
    el: '#app',
    // 在根组件实例化一个容器，传入到provide选项
    provide: new AppContainer(),
    render: (h) => h(App)
});
```

### 注册类

```typescript
bind<IModule>(moduleKeys.A).toClass(ModuleA)
```

### 注册值

```typescript
bind<IModule>(moduleKeys.A).toValue(new ModuleA())
```

### 注册工厂

```typescript
bind<IModule>(moduleKeys.A).toFactory(() => new ModuleA())

// 传入的第二个参数类型为注入标识数组，表明该工厂依赖的其他模块，会依次注入到工厂参数中
bind<IModule>(moduleKeys.B).toFactory((moduleA: IModule, moduleB: IModule) => {
    return new ModuleC(moduleA, moduleB)
}, [moduleKeys.A, moduleKeys.B])


bind<IModule>(moduleKeys.B).toFactory((moduleA: IModule, moduleB: IModule) => {
    if (isSSR) {
        return moduleA
    } else {
        return moduleB
    }
}, [moduleKeys.A, moduleKeys.B])
```

### 拦截`mutation`

以下是简单的缓存例子

```typescript
import Vue from 'vue';
import { bind, Container, IMutation, Mutation, State } from 'vue-class-state';

// 如果想拦截某些Mutation的执行，可以创建一个新的装饰器
const CacheMutation = Mutation({
    before: (mutation: IMutation, _state: Counter) => {
        console.log(`
                    mutation类型，供devtool使用: ${mutation.type}
                    传入mutation方法的参数数组: ${JSON.stringify(mutation.payload)}
                    调用的模块注入标识: ${mutation.identifier}
                    调用的方法名: ${mutation.mutationType}
                `);
    },
    // after选项代表在mutation执行后执行的方法，相对的也提供before选项，用于在mutation执行前进行操作
    after: (_mutation: IMutation, state: Counter) => {
        localStorage.setItem(state.cacheKey, JSON.stringify(state));
    }
});

class Counter {

    cacheKey = 'cache-key';

    @State public num = 0;

    // 严格模式下，修改实例的state值必须调用该实例的Mutation方法
    // 和vuex一致，必须为同步函数
    @CacheMutation
    public add() {
        this.num++;
    }

    // 默认的Mutation不会被拦截
    @Mutation
    public add2() {
        this.num++;
    }

    constructor() {
        const cacheStr = localStorage.getItem(this.cacheKey);
        if (cacheStr) {
            const cache = JSON.parse(cacheStr);
            State.replaceState(this, cache);
        }
        setInterval(() => {
            // 等同于 CacheMutation.commit(this, () => this.num++, 'add');
            this.add();
        }, 1000);
    }
}

const COUNTER = 'counter';

@Container({
    providers: [bind<Counter>(COUNTER).toClass(Counter)],
    strict: [COUNTER]
})
class AppContainer { }

const container = new AppContainer();

new Vue({
    el: '#app',
    template: `<div>{{counter.num}}</div>`,
    computed: {
        counter() {
            return container[COUNTER];
        }
    }
});
```
