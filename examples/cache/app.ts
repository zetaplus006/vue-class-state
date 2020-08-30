import Vue from 'vue';
import { bind, Container, IMutation, Mutation, State } from 'vue-class-state';
// tslint:disable:no-console

// 如果想拦截某些Mutation的执行，可以创建一个新的装饰器,执行顺序和 koa(直接抄它的)一样，洋葱模型,但不支持异步
const CacheMutation = Mutation.create((next: () => void, mutation: IMutation, state: Counter) => {
    // mutation 执行前打印相关信息
    console.log(`
    mutation类型，供devtool使用: ${mutation.type}
    传入mutation方法的参数数组: ${JSON.stringify(mutation.payload)}
    调用的模块注入标识: ${mutation.identifier}
    调用的方法名: ${mutation.mutationType}
    `);
    next();
    // mutation 执行后保存缓存
    localStorage.setItem(state.cacheKey, JSON.stringify(state));
});

class Counter {

    cacheKey = 'cache-key';

    @State public obj = { test: 1 };

    @State public num = 0;

    // @CacheMutation
    @CacheMutation
    public add() {
        this.num++;
    }

    constructor() {
        const cacheStr = localStorage.getItem(this.cacheKey);
        if (cacheStr) {
            // tslint:disable-next-line:no-shadowed-variable
            const cache = JSON.parse(cacheStr);
            State.replaceState(this, cache);
        }
        setInterval(() => {
            // 等同于 CacheMutation.commit(this, () => this.num++, 'add');
            this.add();
        }, 1000);
    }
}

const COUNTER = 'counter';

@Container({
    providers: [bind<Counter>(COUNTER).toClass(Counter)],
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
