## vubx
> Vue状态管理，采用面向对象风格的api设计，灵感来自[mobx](https://github.com/mobxjs/mobx)

<!-- [![npm](https://img.shields.io/npm/dm/vubx.svg)](https://www.npmjs.com/package/vubx) -->

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
    // 若使用严格模式及依赖注入则需要一个root节点，用于保存全局数据
    root: true,
    // 注入标识，后面文档会详细介绍
    identifier: Symbol()
})
class Addition extends Service {

    // 类中的数据在初始化后会被Vue观察到
    a = 0;
    b = 1;

    // 本类中的getter 都会代理为Vue的计算属性
    get sum() {
        return this.a + this.b;
    }

    // 突变方法，与vuex概念一致必须为同步函数
    @mutation
    change() {
        const temp = this.sum;
        this.a = this.b;
        this.b = temp;
    }

}

const addition = new Addition();

// 开启严格模式，类实例中数据只能在打了@mutation注解的类方法中被修改
addition.useStrict();

// 使该实例能被vuex的devtool观察到
addition.useDevtool();

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
    identifier: moduleKeys.root,
    providers: [
        // 绑定服务注入规则，toClass 绑定一个实现IModule接口的类，默认为单例模式
        // 注意providers选项只有在root模块中生效
        bind<IModule>(moduleKeys.A).toClass(ModuleA),
        bind<IModule>(moduleKeys.B).toClass(ModuleB)
    ]
})
class Root extends Service {

    // 通过注入标识异步注入模块，既当读取到此属性时才初始化该实例
    // 注意devtool和严格模式也会触发实例化
    @lazyInject(moduleKeys.A)
    public moduleA: IModule;

    @lazyInject(moduleKeys.B)
    public moduleB: IModule;

}

const rootModule = new Root().useDevtool().useStrict();

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
bind<IModule>(moduleKeys.B).toFactory(() => new ModuleA()).inTransientScope()
```


### 在模块中注入其他模块

```typescript
@observable()
class Module extends Service {

    // 通过注入标识异步注入模块，既当读取到此属性时才初始化该实例
    // 注意devtool和严格模式也会触发实例化
    @lazyInject(moduleKeys.A)
    public moduleA: IModule;

    // 如果传入注入标识，则取属性名为标识，此例子同 @lazyInject('moduleB')，但不建议使用
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
    template: '<div>{{text}}</div>',
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

未完待续