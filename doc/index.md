## vubx
> 一款专门为Vue设计的集中式状态管理库，采用面向对象风格的api设计，灵感来自[mobx](https://github.com/mobxjs/mobx)

[![npm](https://img.shields.io/npm/dm/vubx.svg)](https://www.npmjs.com/package/vubx)


## vubx介绍
`vubx`可以视为`vuex`的面向对象风格版本，提供以下功能：

1.`state`、`getters`、`mutation`，其概念与`vuex`基本相通，区别是vubx是以class(类)和decorator(注解)的形式来实现的。

2.简单的依赖注入，用于解决子模块之间共享数据的问题，并支持懒加载。(此功能主要参考[InversifyJS](https://github.com/inversify/InversifyJS)的api设计)

3.插件化：模块插件及全局插件。

4.`mutation`中间件：支持模块中间件及全局中间件。

4.支持严格模式，开启后`state`只能在`mutation`中被修改。

5.支持`vue`官方devtool,可以在devtool的vuex标签下查看`vubx`的`state`、`getters`、`mutation`。

6.同时支持`Typescript`和`ECMAScript`，使用Typescript体验最佳,起初就是专门为Vue+Typescript设计的。

## 安装

```bash
npm install vubx 
```

## 基本使用

此例子`Typescript`和`javaScript`均可运行

``` typescript
import Vue from 'vue';
import { createDecorator, Service, mutation } from 'vubx';

const observable = createDecorator(Vue);

@observable({
    // 若使用严格模式及依赖注入则需要一个root节点，用于保存全局数据
    root: true,
    // 服务标识，后面文档会详细介绍
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
        const temp = this.a;
        this.a = this.b;
        this.b = temp + this.b;
    }

}

const addition = new Addition();

// 开启严格模式，类实例中数据只能在打了@mutation注解的类方法中被修改
addition.useStrict();

// 使该实例能被vue的devtool观察到
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



