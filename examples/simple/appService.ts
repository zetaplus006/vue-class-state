import Vue from 'vue';
import { createDecorator, Service, mutation } from 'vubx';
import devtool from '../../src/plugins/devtool';

const obverable = createDecorator(Vue);

export interface IPerson {
    name: string;
    age: number;
}

@obverable({
    strict: true,
    identifier: Symbol('app')
})
export class AppService extends Service {
    list: IPerson[] = [];

    name: string = '';

    data = {
        num: 0
    };

    get Person() {
        return this.list;
    }

    userInfo: UserService;
    userInfoOther: UserService;

    constructor(test: string) {
        super();
        this.appendChild<UserService>(new UserService, 'userInfo', Symbol('userInfo'));
    }

    @mutation
    addPerson() {
        // this.list.push({
        //     name: 'bruce',
        //     age: 16
        // });
        this.changeName(this.name + 's');
        this.data.num = 10;
        // this.$emit('test', { a: 'ss' });
    }

    @mutation
    changeName(newName: string) {
        this.name = newName;
    }

    closer: any;
    created() {
        this.closer = this.$watch('list', (val) => {
            console.log(val);
            this.closer();
        });
        this.$on('test', function(obj: any) {
            console.log(obj);
        });
        setTimeout(() => {
            // this.userInfo.change();
        }, 1000);
        // this.changeName('sddd');
    }
}

@obverable()
export class UserService extends Service {
    info: IPerson = {
        name: 'bruce',
        age: 16
    };

    get computed() {
        return this.info;
    }
    @mutation
    change() {
        this.info.age++;
    }
}
