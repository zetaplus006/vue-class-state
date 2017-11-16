import Vue from 'vue';
import { createDecorator, Service, mutation, lazyInject, bind, IService, IMutation } from 'vubx';

const observable = createDecorator(Vue);

const cacheKey = 'cache-key';

const plugin = (store: Addition) => {
    store.subscribe({
        after: () => {
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
class Addition extends Service {

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

const addition = new Addition();

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