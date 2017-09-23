import Vue from 'vue';
import {
    createDecorator,
    Service,
    mutation,
    lazyInject,
    bind,
    IService,
    IMutation
} from 'vubx';

console.log(Vue['options']);
console.log(Object.keys(Vue));
import * as vubx from 'vubx';

const observable = createDecorator(Vue);

const key = Symbol('child');
const factoryKey = Symbol('factory');
const valueKey = Symbol('value');
const asyncKey = Symbol('async');
const factoryDepKey = Symbol('factoryDepKey');

export interface IChildren extends IService {
    text: string;
    msg: string;
}

let n = 1;

@observable()
export class Children extends Service implements IChildren {
    text = 'child service ';
    index: number;
    get msg() {
        return this.text + this.index + '  is loading...';
    }

    constructor() {
        super();
        this.index = n++;
        console.log(this.msg);
    }
}

@observable({
    identifier: Symbol('appService'),
    root: true,
    vueMethods: true,
    providers: [
        bind<IChildren>(key).toClass(Children),
        bind<IChildren>(factoryKey).toFactory(() => new Children()),
        bind<IChildren>(valueKey).toValue(new Children()),
        bind<IChildren>(factoryDepKey).toFactory((c: IChildren) => c, [key])
    ],
    plugins: [
        (s: IService) => {
            s.subscribeGlobal({
                before: (m: IMutation, service: IService) => {
                    console.log(service);
                }
            });
        }
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

    @lazyInject(valueKey)
    public child4: IChildren;

    @lazyInject(factoryDepKey)
    public childDeps: IChildren;

    // computed
    get sum() {
        return this.num1 + this.num2;
    }

    // vubx hook
    created() {
        this.appendChild(new Children(), 'child1', Symbol('appendChild'));
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
