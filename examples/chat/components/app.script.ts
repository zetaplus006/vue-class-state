import { ChatStore, serviceKey } from '../store/index';
import Vue from 'vue';
import component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import Mod from './Mod.vue';

@component({
    components: {
        Mod
    }
})
export default class App extends Vue {
    @Inject(serviceKey.CHAT)
    chat: ChatStore;

    mounted() {
        console.log(this.chat, this);
        setTimeout(() => this.chat.init(), 1000);
    }
}