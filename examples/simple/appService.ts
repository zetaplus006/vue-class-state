import Vue from 'vue';
import { createDecorator, Service, mutation } from 'vubx';

const obverable = createDecorator(Vue);

export interface IPerson {
    name: string;
    age: number;
}

@obverable({
    strict: true
})
export class AppService extends Service {
    list: IPerson[] = [];

    name: string = 'appName';

    get Person() {
        return this.list;
    }

    userInfo: UserService;

    constructor() {
        super();
        this.appendChild<UserService>(new UserService, 'userInfo', Symbol('userInfo'));
    }

    @mutation
    addPerson() {
        this.list.push({
            name: 'bruce',
            age: 16
        });
        this.changeName(this.name + 's');
        this.$emit('test', { a: 'ss' });
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
        this.changeName('sddd');

    }
}

@obverable()
export class UserService extends Service {
    info: IPerson = {
        name: 'bruce',
        age: 16
    };
}