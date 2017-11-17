## vubx
> Vue状态管理，采用面向对象风格的api设计，灵感来自[mobx](https://github.com/mobxjs/mobx)


## 索引

- [vubx](#vubx)
- [索引](#索引)
- [vubx介绍](#vubx介绍)
- [安装](#安装)
- [基本使用](#基本使用)
- [依赖注入](#依赖注入)
    - [基本例子](#基本例子)
    - [注册模块](#注册模块)
        - [注册类](#注册类)
        - [注册值](#注册值)
        - [注册工厂](#注册工厂)
        - [单例与多例](#单例与多例)
    - [在模块中注入其他模块](#在模块中注入其他模块)
    - [在Vue组件中注入模块](#在vue组件中注入模块)
- [插件与中间件](#插件与中间件)
    - [基本例子](#基本例子-1)
    - [插件详解](#插件详解)
    - [mutation中间件详解](#mutation中间件详解)
- [生命周期](#生命周期)

## vubx介绍
`vubx`可以视为`vuex`的面向对象风格版本，提供以下功能：

1.`state`、`getters`、`mutation`，其概念与`vuex`基本相通，区别是vubx是以class(类)和decorator(装饰器)的形式来实现的。

2.简单的依赖注入，用于解决子模块之间共享数据的问题，并支持懒加载,此功能不仅能在状态管理中使用，也可与Vue的[provide/inject](https://cn.vuejs.org/v2/api/#provide-inject)配合使用。(此功能主要参考[InversifyJS](https://github.com/inversify/InversifyJS)的api设计)

3.插件化：模块插件及全局插件。

4.`mutation`中间件：支持模块中间件及全局中间件。

4.支持严格模式，开启后`state`只能在`mutation`中被修改。

5.支持`vue`官方devtool,可以在devtool的vuex标签下查看`vubx`的`state`、`getters`、`mutation`。

6.同时支持`Typescript`和`ECMAScript`，使用TypeScript体验最佳,起初就是专门为Vue+Typescript设计的。

## 安装

```bash
npm install vubx --save
```

注意:

1.TypeScript用户需要开启tsconfig.json中的`experimentalDecorators`和`allowSyntheticDefaultImports`的编译选项

2.javaScript+Babel用户需要[babel-plugin-transform-decorators-legacy](babel-plugin-transform-decorators-legacy)插件,以支持[ECMAScript stage 1 decorators](https://github.com/wycats/javascript-decorators/blob/master/README.md)

3.需要支持[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)的运行环境

## 基本使用

此例子`TypeScript`和`javaScript`均可运行

``` typescript
import Vue from 'vue';
import { createDecorator, Service, mutation } from 'vubx';

const observable = createDecorator(Vue);

@observable({
    // 若使用严格模式及依赖注入则需要一个root模块，用于保存全局数据
    root: true,
    // 注入标识，后面文档会详细介绍
    identifier: 'root',
    // 开启严格模式，类实例中数据只能在添加了@mutation装饰器的方法中修改
    strict: true,
    // 使该模块及其注册的其他模块能被vue的devtool观察到
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

    // 突变方法，与vuex概念一致必须为同步方法
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
```

## 依赖注入
以下例子均使用TypeScript,将其接口、类型、泛型代码部分去掉既可在javaScript中使用。

### 基本例子

``` typescript
import Vue from 'vue';
import { createDecorator, Service, mutation, lazyInject, bind, IService } from 'vubx';
import component from 'vue-class-component';

const observable = createDecorator(Vue);

// 定义服务标识
const moduleKeys = {
    root: 'root',
    A: 'moduleA',
    B: 'moduleB'
};

// 定义接口
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

@observable({
    root: true,
    strict: true,
    devtool: true,
    identifier: moduleKeys.root,
    providers: [
        // 绑定服务注入规则，toClass 绑定一个实现IModule接口的类，默认为单例模式
        // 注意providers选项只有在root模块中生效
        bind<IModule>(moduleKeys.A).toClass(ModuleA),
        bind<IModule>(moduleKeys.B).toClass(ModuleB)
    ]
})
class Root extends Service {

    // 通过注入标识注入模块，当读取到此属性时才初始化该模块实例
    // 注意devtool和严格模式也会触发实例化
    @lazyInject(moduleKeys.A)
    public moduleA: IModule;

    @lazyInject(moduleKeys.B)
    public moduleB: IModule;

}

const rootModule = new Root();

// 配合vue-class-component获取更完善的开发体验
@component({
    template: '<div>{{text}}</div>',
    // 在组件内注入服务，也是支持懒加载的
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

```

### 注册模块

#### 注册类
```typescript
bind<IModule>(moduleKeys.A).toClass(ModuleA)
```

#### 注册值
```typescript
bind<IModule>(moduleKeys.A).toValue(new ModuleA())
```

#### 注册工厂
```typescript
bind<IModule>(moduleKeys.A).toFactory(() => new ModuleA())

// 传入的第二个参数类型为注入标识数组，表明该工厂依赖的其他模块，会依次注入到工厂参数中
// 用于弥补vubx不支持构造函数参数注入的缺陷
bind<IModule>(moduleKeys.B).toFactory((moduleA: IModule, moduleB: IModule) => {
    return new ModuleC(moduleA, moduleB)
}, [moduleKeys.A, moduleKeys.B])


bind<IModule>(moduleKeys.B).toFactory((moduleA: IModule, moduleB: IModule) => {
    if (isIOS) {
        return moduleA
    } else {
        return moduleB
    }
}, [moduleKeys.A, moduleKeys.B])
```

#### 单例与多例
默认为单例注册，支持多例但不建议使用，单一值注册（toValue）不支持多例
```typescript
// 注册为单例
bind<IModule>(moduleKeys.A).toClass(ModuleA).inSingletonScope()

// 注册为多例
bind<IModule>(moduleKeys.A).toClass(ModuleA).inTransientScope()

// 工厂多例意味着每次注入该模块都会调用此工厂方法
bind<IModule>(moduleKeys.A).toFactory(() => new ModuleA()).inTransientScope()
```


### 在模块中注入其他模块

```typescript
@observable()
class Module extends Service {

    // 通过注入标识注入模块，当读取到此属性时才初始化该模块实例
    // 注意devtool和严格模式也会触发实例化
    @lazyInject(moduleKeys.A)
    public moduleA: IModule;

    // 如果没传入注入标识，则取属性名为标识，此例子同 @lazyInject('moduleB')，但不建议使用
    @lazyInject()
    public moduleB: IModule;

}
```
### 在Vue组件中注入模块

Vue已经提供[provide/inject](https://cn.vuejs.org/v2/api/#provide-inject)功能，可以很方便的注入vubx模块

```typescript

// 在Vue实例中传入provide选项
const rootModule = new Root()
new Vue({
    el: '#app',
    provide: rootModule.getProvide(),
    render: h => h(App)
});

// 注入到组件，配合vue-class-component官方库，在TypeScript环境下可获取完善的类型校验
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

```

若使用[Vue Property Decorator](https://github.com/kaorun343/vue-property-decorator)或者使用自定义的装饰器，也可如下例所写，更加简洁
```typescript
@component({
    template: '<div>{{text}}</div>'
})
class App extends Vue {

    @Inject(moduleKeys.A)
    moduleA: IModule;

    @Inject()
    moduleB: IModule;

    get text() {
        return this.moduleA.text + this.moduleB.text;
    }
}
```

## 插件与中间件

### 基本例子

以下是简单的缓存例子

```typescript
import Vue from 'vue';
import { createDecorator, Service, mutation } from 'vubx';

const observable = createDecorator(Vue);

const cacheKey = 'cache-key';

const plugin = (store: Counter) => {
    // subscribe方法用于订阅mutation中间件，
    store.subscribe({
        // after选项代表在mutation执行后执行的方法，相对的也提供before选项，用于在mutation执行前进行操作
        after: () => {
            // store中所有被Vue观察到的数据都会被代理到$state对象中
            localStorage.setItem(cacheKey, JSON.stringify(store.$state));
        }
    });
};

@observable({
    root: true,
    identifier: 'counter',
    strict: true,
    devtool: true,
    // 注册插件，插件在此类实例化后执行
    plugins: [
        plugin
    ]
})
class Counter extends Service {

    num = 0;

    @mutation
    add() {
        this.num++;
    }

    init() {
        const cacheStr = localStorage.getItem(cacheKey);
        if (cacheStr) {
            const cache = JSON.parse(cacheStr);
            this.replaceState(cache);
        }
        setInterval(() => {
            this.add();
        }, 1000);
    }
}

const addition = new Counter();

new Vue({
    el: '#app',
    template: `<div>{{addition.num}}</div>`,
    computed: {
        addition() {
            return addition;
        }
    },
    mounted() {
        addition.init();
    }
});

```

### 插件详解

`vubx`的插件分为`模块插件`与`全局插件`，上述的缓存例子便是一个简单的`模块插件`，只会在注册的本模块初始化时执行，当项目有很多模块时，可以选择性的给某些模块加入缓存机制。

如下注册`全局插件`，注意globalPlugins选项只在`root模块`中有效，并且`全局插件`会在providers选项下注册的所有模块被第一次注入时执行，对于`root模块`只会在初始化时执行，`模块插件`的执行时机也与其一致。
```typescript
@observable({
    root: true,
    identifier: 'counter',
    strict: true,
    devtool: true,
    // 在此注册模块插件
    plugins: [
        plugin
    ],
    // 在此注册全局插件
    globalPlugins: [
        createLoggerPlugin()
    ]
})
class Counter extends Service {
    // ....
}
```

### mutation中间件详解

在严格模式下，`vubx`中的`state`只能通过mutation方法改变，mutation中间件的功能就是可以在`mutation`方法执行前和执行后进行一系列统一的业务操作，其实也可以说是实现了`AOP`的模式。

这是一个简单的例子：在`mutation`方法执行前打印`mutation`信息，在其执行后缓存模块的状态到localStorage
```typescript
store.subscribe({
    before: (mutation: IMutation, service: IService) => {
        console.log(`
            type: ${mutation.type}
            payload: ${JSON.stringify(mutation.payload)}
            methodName: ${mutation.methodName}
            identifier: ${mutation.identifier}
        `);
    },
    after: (mutation: IMutation, service: IService) => {
        localStorage.setItem(cacheKey, JSON.stringify(service.$state));
    }
});
```
vubx的mutation定义如下
```typescript
interface IMutation {
    // 为适配vuex的devtool而设置的字段，一般不会用于业务
    type: string;
    // 传入mutation方法的参数数组
    payload: any[];
    // 调用的方法名
    methodName: string;
    // 调用的模块注入标识,在全局中间件中可以用来判断是哪个模块调用的
    identifier: IIdentifier;
}
```

全局中间件的订阅使用`subscribeGlobal`方法，使用方式和`subscribe`一致，但只要`root模块`可以调用,作用于在`root模块`注册的所有模块。

## 生命周期

由于vubx的实现机制是创建个子类代替父类的引用，并在子类中做代理Vue数据和依赖注入信息的初始化，因此在父类的构造函数中是无法读取注入进来的模块，但vubx提供了个初始化成功的调用钩子用于替代构造函数。

```typescript
@created()
init() {
   // 可以在此初始化
}

// 传入注入标识数组，会依次注入在钩子方法的参数中
@created(['moduleA','moduleB'])
init(moduleA , moduleA) {
   // 可以在此初始化
}
```

