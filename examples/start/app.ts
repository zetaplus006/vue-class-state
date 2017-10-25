import Vue from 'vue';
import { createDecorator, Service, mutation } from 'vubx';

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