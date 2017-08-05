import Vue from 'vue';
import {
    createDecorator,
    Service,
    mutation,
    bindClass,
    bindFactory,
    lazyInject,
    IService
} from 'vubx';
const obverable = createDecorator(Vue);

const key = Symbol('child');
const factoryKey = Symbol('factory');

export interface IChildren extends IService {
    text: string;
}

let n = 1;

@obverable()
export class Children extends Service implements IChildren {

    text = 'child service ';
    constructor() {
        super();
        this.text += n++;
    }
}

@obverable({
    strict: true,
    identifier: Symbol('appService'),
    root: true,
    provider: [
        bindClass<IChildren>(key, Children),
        bindFactory<IChildren>(factoryKey, () => new Children())
    ],
    injector: [
        lazyInject<AppService>('child', key),
        lazyInject<AppService>('childFromFactory', factoryKey)
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
        this.appendChild(new Children(), 'child2', Symbol('appChild'));
        console.log(this.child2 === this.childFromFactory);
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
