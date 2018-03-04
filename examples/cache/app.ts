import Vue from 'vue';
import { bind, Container, IMutation, Mutation, State } from 'vue-class-state';

class Counter {
    cacheKey = 'cache-key';

    @State public num = 0;

    @Mutation
    public add() {
        this.num++;
    }

    public sub() {
        // 可以拦截Mutation的执行
        State.subscribe(this, {
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
                localStorage.setItem(this.cacheKey, JSON.stringify(this));
            }
        });
    }
    constructor() {
        this.sub();
        const cacheStr = localStorage.getItem(this.cacheKey);
        if (cacheStr) {
            const cache = JSON.parse(cacheStr);
            State.replaceState(this, cache);
        }
        setInterval(() => {
            // 等同于 Mutation.commit(this, () => this.num++, 'add');
            this.add();
        }, 1000);
    }
}

const COUNTER = 'counter';

@Container({
    providers: [bind<Counter>(COUNTER).toClass(Counter)],
    devtool: [COUNTER],
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
