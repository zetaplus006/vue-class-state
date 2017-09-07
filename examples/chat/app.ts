import Vue from 'vue';
import App from './components/App.vue';
import provide from './store';
console.log(provide);
new Vue({
    el: '#app',
    provide,
    render: h => h(App)
});
