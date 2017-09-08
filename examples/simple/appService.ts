import Vue from 'vue';
import {
    createDecorator,
    Service,
    mutation,
    lazyInject,
    bind,
    IService
} from 'vubx';

import * as vubx from 'vubx';
console.log(Object.keys(vubx).sort());

const obverable = createDecorator(Vue);

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

@obverable()
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

@obverable({
    identifier: Symbol('appService'),
    root: true,
    vueMethods: true,
    providers: [
        bind<IChildren>(key).toClass(Children),
        bind<IChildren>(factoryKey).toFactory(() => new Children()),
        bind<IChildren>(valueKey).toValue(new Children()),
        bind<IChildren>(factoryDepKey).toFactory((c: IChildren) => c, [key])
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
        console.log('---------', this.getProvider().get(key) === this.getProvider().get(key));
        console.log('---------2', this.getProvider().proxy[key] === this.getProvider().proxy[key]);
        console.log('---------2', this.childDeps === this.child2);
    }

    @mutation
    change() {
        this.num1++;
        this.num2++;
    }
}
