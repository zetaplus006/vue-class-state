import test from 'ava';
import { bind, Container, IMutation, Mutation, State } from '../../../lib/vue-class-state';

test('instance middleware', t => {

    const TestMutation = Mutation({
        before: (m: IMutation, _state: Test) => {
            m.payload[0].a = 10;
        },
        // tslint:disable-next-line:no-shadowed-variable
        after: (_m: IMutation, state: Test) => {
            state.count = 20;
        }
    });

    class Test {

        @State public data = {
            a: 1,
            b: 2
        };

        @State public count = 0;

        @TestMutation public change(data: any, count: number) {
            Object.assign(this.data, data);
            this.count = count;
        }

    }

    const state = new Test();
    state.change({
        a: 5,
        b: 6
    }, 1);
    t.deepEqual(state.data, { a: 10, b: 6 });
    t.true(state.count === 20);
});

test('global middleware', t => {
    const testKey: string = 'test';

    State.globalSubscribe({
        before: (m: IMutation, state: Test) => {
            t.true(state instanceof Test);
            t.true(state.count === 0);
            t.true(m.identifier === testKey);
            t.true(m.type === `${testKey}: change`);
            t.true(m.mutationType === 'change');
            t.deepEqual(m.payload, [100]);
        },
        after: (m: IMutation, state: Test) => {
            t.true(state instanceof Test);
            t.true(state.count === 100);
            t.true(m.identifier === testKey);
            t.true(m.type === `${testKey}: change`);
            t.true(m.mutationType === 'change');
            t.deepEqual(m.payload, [100]);
        }
    });
    class Test {
        @State public count = 0;

        @Mutation public change(count: number) {
            this.count = count;
        }

    }

    @Container({
        providers: [
            bind<Test>(testKey).toClass(Test)
        ]
    })
    class TestContainer { }

    const state1 = new TestContainer()[testKey] as Test;
    state1.change(100);

});
