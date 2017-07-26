import { obsverable } from 'vues';

export interface IPerson {
    name: string
    age: number
}

@obsverable
export class AppService {
    list: IPerson[] = []
    id = 'ssss';
    constructor() {
        this.id = 'aaaaa';
    }
    addPerson() {
        this.list.push({
            name: 'bruce',
            age: 16
        })
    }

}