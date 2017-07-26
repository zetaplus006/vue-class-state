import Vue from 'vue';
import Vues from '../../src'
import Simple from './Simple.vue';
Vue.use(Vues);

new Vue({
    el: '#app',
    render: h => h(Simple)
})

