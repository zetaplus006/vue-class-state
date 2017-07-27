import Vue from 'vue';
import { createObserveDecorator, Service } from 'vues';


const obverable = createObserveDecorator(Vue)


export interface IPerson {
    name: string
    age: number
}

@obverable
export class AppService extends Service {
    list: IPerson[] = []
    get Person() {
        return this.list;
    }

    addPerson() {
        this.list.push({
            name: 'bruce',
            age: 16
        })
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