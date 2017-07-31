import { identifier } from '../store/index';
export default {
    inject: [identifier.CHAT, identifier.MESSAGE, identifier.THREADS],
    mounted() {
        console.log(this);
    }
}