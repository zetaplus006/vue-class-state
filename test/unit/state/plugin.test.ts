import test from 'ava';
import { bind, Container, State } from '../../../lib/vue-class-state';

test('global plugin', t => {
    const testKey = 'test';
    class Test {
        @State public count = 0;

        constructor() {
            t.is(this.count, 0);
        }
    }

    @Container({
        providers: [
            bind<Test>(testKey).toClass(Test)
        ],
        globalPlugins: [
            (data: Test) => data.count = 100
        ]
    })
    class TestContainer { }

    const state = new TestContainer()[testKey] as Test;
    t.is(state.count, 100);
});
