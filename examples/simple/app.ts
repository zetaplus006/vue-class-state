import Vue from 'vue';
import vubx from '../../src'
import Simple from './Simple.vue';
Vue.use(vubx);

new Vue({
    el: '#app',
    render: h => h(Simple)
})

