import Vue from 'vue';
import vues from 'vues';
import Simple from './Simple.vue';

console.log('hello world', vues, Simple, Vue.prototype.$isServer);

new Vue({
    el: '#app',
    render: h => h(Simple)
})