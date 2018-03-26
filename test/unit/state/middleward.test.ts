import test from 'ava';
import { IMutation, Mutation, State } from '../../../lib/vue-class-state.common';

test('instance middleware', t => {

    const list = [];

    const TestMutation = Mutation.create((next: () => void, m: IMutation) => {
        m.payload[0].a = 10;
        list.push(1);
        next();
        list.push(5);
    }, (next: () => void) => {
        list.push(2);
        next();
        list.push(4);
    });

    class Test {

        @State public data = {
            a: 1,
            b: 2
        };

        @State public count = 0;

        @TestMutation public change(data: any, count: number) {
            Object.assign(this.data, data);
            list.push(3);
            this.count = count;
        }

    }

    const state = new Test();
    state.change({
        a: 5,
        b: 6
    }, 1);
    t.deepEqual(state.data, { a: 10, b: 6 });
    t.deepEqual(list, [1, 2, 3, 4, 5]);
});
