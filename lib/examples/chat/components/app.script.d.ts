import { ChatStore } from '../store/index';
import Vue from 'vue';
export default class App extends Vue {
    chat: ChatStore;
    mounted(): void;
}
