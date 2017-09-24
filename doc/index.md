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



