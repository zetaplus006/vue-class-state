import { Getter, Mutation, State } from 'vubx';
import Vue from 'vue';

class Addition {

    // 类中的数据在初始化后会被Vue观察到
    @State public a = 0;
    @State public b = 1;

    // 本类中的getter 都会代理为Vue的计算属性
    @Getter get sum() {
        return this.a + this.b;
    }

    // 突变方法，与vuex一致必须为同步函数
    @Mutation
    public change() {
        const temp = this.sum;
        this.a = this.b;
        this.b = temp;
    }

}

const addition = new Addition();
// tslint:disable-next-line:no-console
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
