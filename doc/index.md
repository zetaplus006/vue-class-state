# vubx
> 集中式状态管理，采用面向对象风格的api设计，灵感来自[mobx](https://github.com/mobxjs/mobx)

[![npm](https://img.shields.io/npm/dm/vubx.svg)](https://www.npmjs.com/package/vubx)

## 索引
- [vubx介绍](#vubx介绍)
- [基础功能](#基础功能)

## vubx介绍
`vubx`可以视为`vuex`的面向对象风格版本，提供以下功能：

1.`state`、`getters`、`mutation`，其概念与`vuex`相通，

2.简单的依赖注入，用于解决子模块之间共享数据的问题

3.支持严格模式，开启后`state`只能在`mutation`中被修改

4.支持`vue`官方devtool,可以在devtool的vuex标签下查看`vubx`的`state`、`getters`、`mutatio