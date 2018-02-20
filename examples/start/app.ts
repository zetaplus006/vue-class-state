import Vue from 'vue';
import { createDecorator, Service, mutation, lazyInject, bind, IService } from 'vubx';

const observable = createDecorator(Vue);

@observable()
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
console.log(addition);
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
            this.addition.change();
        }, 2000);
    }
});
