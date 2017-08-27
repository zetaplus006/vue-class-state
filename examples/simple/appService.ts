import Vue from 'vue';
import {
    createDecorator,
    Service,
    IService,
    mutation,
    bindClass,
    bindFactory,
    lazyInject
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
    constructor( @pp public aa?: number) {
        super();
        this.text += n++;
    }
}

function pp(target: any, propertyKey: PropertyKey, index: number) {
    console.log(target.prototype, target);
}

@obverable({
    identifier: Symbol('appService'),
    root: true,
    provider: [
        bindClass<IChildren>(key, Children),
        bindFactory<IChildren>(factoryKey, () => new Children())
    ]
})
export class AppService extends Service {

    // state
    private num1: number = 0;
    private num2: number = 0;
    private closer: any;

    public child1: IChildren;

    @lazyInject(key)
    public child2: IChildren;

    @lazyInject(factoryKey)
    public child3: IChildren;

    // computed
    get sum() {
        return this.num1 + this.num2;
    }

    // vubx hook
    created() {
        this.appendChild(new Children(), 'child1', Symbol('appChild'));
        this.$on('close', () => {
            clearInterval(this.closer);
        });
        this.$watch('sum', (sum) => {
            if (sum >= 10) {
                console.log(this.child1);
                console.log(this.child2 === this.child3);
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
