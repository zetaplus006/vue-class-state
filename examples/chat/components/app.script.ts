import { identifier, ChatStore } from '../store/index';
import Vue from 'vue';
import component from 'vue-class-component';
import { Inject, Prop } from 'vue-property-decorator';

@component
export default class App extends Vue {
    @Inject(identifier.CHAT)
    chat: ChatStore;

    mounted() {
        console.log(this.chat, this);
        setTimeout(() => this.chat.init(), 1000);
    }
}