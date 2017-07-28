import Vue from 'vue';
import { createObserveDecorator, Service, mutation } from 'vubx';


const obverable = createObserveDecorator(Vue, { strict: true })


export interface IPerson {
    name: string
    age: number
}


@obverable
export class AppService extends Service {
    list: IPerson[] = []

    name: string = 'appName'

    get Person() {
        return this.list;
    }

    @mutation
    addPerson() {
        this.list.push({
            name: 'bruce',
            age: 16
        })
        this.changeName(this.name + 's');
        this.$emit('test', { a: 'ss' });
    }

    @mutation
    changeName(newName: string) {
        this.name = newName;
    }

    beforeCreate() {

    }

    closer: any
    created() {
        this.closer = this.$watch('list', (val) => {
            console.log(val)
            this.closer();
        });
        this.$on('test', function (obj: any) {
            console.log(obj);
        });
    }
}