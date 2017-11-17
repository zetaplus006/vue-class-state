import Vue from 'vue';
import { createDecorator, Service, mutation } from 'vubx';

const observable = createDecorator(Vue);

const cacheKey = 'cache-key';

const plugin = (store: Counter) => {
    // subscribe方法用于订阅mutation中间件，
    store.subscribe({
        // after选项代表在mutation执行后执行的方法，相对的也提供before选项，用于在mutation执行前进行操作
        after: () => {
            // store中所有被Vue观察到的数据都会被代理到$state对象中
            sessionStorage.setItem(cacheKey, JSON.stringify(store.$state));
        }
    });
};

@observable({
    root: true,
    identifier: 'counter',
    strict: true,
    devtool: true,
    // 插件，插件在此类实例化后执行
    plugins: [
        plugin
    ]
})
class Counter extends Service {

    num = 0;

    @mutation
    add() {
        this.num++;
    }

    init() {
        const cacheStr = sessionStorage.getItem(cacheKey);
        if (cacheStr) {
            const cache = JSON.parse(cacheStr);
            this.replaceState(cache);
        }
        setInterval(() => {
            this.add();
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