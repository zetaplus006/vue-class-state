import Vue from 'vue';
import { IMutation, Mutation, State } from 'vue-class-state';

const cacheKey = 'cache-key';

class Counter {

    @State public num = 0;

    @Mutation
    public add() {
        this.num++;
    }

    public sub() {
        State.subscribe(this, {
            // tslint:disable-next-line:no-shadowed-variable
            before: (mutation: IMutation, _state: Counter) => {
                // tslint:disable-next-line:no-console
                console.log(`
                    mutation类型，给devtool使用: ${mutation.type}
                    传入mutation方法的参数数组: ${JSON.stringify(mutation.payload)}
                    调用的模块注入标识: ${mutation.identifier}
                    调用的方法名: ${mutation.mutationType}
                `);
            },
            // after选项代表在mutation执行后执行的方法，相对的也提供before选项，用于在mutation执行前进行操作
            after: () => {
                // store中所有被Vue观察到的数据都会被代理到$state对象中
                localStorage.setItem(cacheKey, JSON.stringify(this));
            }
        });
    }

    public init() {
        this.sub();
        const cacheStr = localStorage.getItem(cacheKey);
        if (cacheStr) {
            const cache = JSON.parse(cacheStr);
            State.replaceState(this, cache);
        }
        setInterval(() => {
            // this.add();
            Mutation.commit(this, () => this.num++, 'add');
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
