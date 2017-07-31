import Vue from 'vue';
import { createDecorator, Service, mutation } from 'vubx';
import { identifier } from '../chat/store/index';

const obverable = createDecorator(Vue);

@obverable({
    strict: true,
    identifier: 'appService'
})
export class AppService extends Service {

    // state
    private num1: number = 0;
    private num2: number = 0;

    // No initial value, Will not enter the vue
    private closer: any;

    // computed
    get sum() {
        return this.num1 + this.num2;
    }

    // vubx hook
    created() {
        this.$on('close', () => {
            clearInterval(this.closer);
        });
        this.$watch('sum', (sum) => {
            if (sum >= 10) {
                console.log(this.sum);
            }
        });
    }

    start() {
        this.closer = setInterval(() => {
            this.change();
            if (this.sum >= 10) {
                this.$emit('close');
            }
        }, 1000);
    }

    @mutation
    change() {
        this.num1++;
        this.num2++;
    }
}
