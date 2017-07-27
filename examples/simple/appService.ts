import Vue from 'vue';
import { createObserveDecorator, Service, mutation } from 'vues';


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

    addPerson() {
        /* this.list.push({
            name: 'bruce',
            age: 16
        }) */
        this.changeName(this.name + 's');
    }

    @mutation
    changeName(newName: string) {
        this.name = newName;
    }

    beforeCreate() {

    }

    closer: any
    created() {
        const closer = this.$watch('list', (val) => {
            console.log(val)
            closer();
        });
        this.$emit('test');
    }
}