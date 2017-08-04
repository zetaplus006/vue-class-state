import Vue from 'vue';
import { createDecorator, Service, mutation } from 'vubx';
import { identifier } from '../chat/store/index';
import { lazyInject, bindFactory, bindClass } from '../../src/service/provider';
const obverable = createDecorator(Vue);

const key = Symbol('child');
const factoryKey = Symbol('factory');

@obverable({
    injector: [
        // from parent 
        // lazyInject<Children>('child', key)
    ]
})
export class Children extends Service {
    text = 'lazyInject child service';
    child: Children;
}

@obverable({
    // strict: true,
    identifier: Symbol('appService'),
    root: true,
    provider: [
        bindClass<Children>(key, Children),
        bindFactory<Children>(factoryKey, () => new Children())
    ],
    injector: [
        lazyInject<AppService>('child', key),
        lazyInject<AppService>('childFromFactory', key)
    ]
})
export class AppService extends Service {

    // state
    private num1: number = 0;
    private num2: number = 0;

    // No initial value, Will not enter the vue
    private closer: any;

    child: Children;
    child2: Children;
    childFromFactory: Children;
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
                console.log(this.child);
                console.log(this.childFromFactory);
            }
        });
        this.appendChild(new Children(), 'child2', Symbol('child2'));
    }

    start() {
        this.closer = setInterval(() => {
            this.change();
            if (this.sum >= 10) {
                this.$emit('close');
            }
        }, 1000);
        // console.log(this);
        // setTimeout(() => {
        //     console.log(this.child);
        // }, 3000);
    }

    @mutation
    change() {
        this.num1++;
        this.num2++;
    }
}
