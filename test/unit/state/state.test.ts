import test from 'ava';
import { Getter, Mutation, State } from '../../../lib/vue-class-state';

test('$state $getters', (t) => {
    class Test {
        @State public a = 1;
        @State public b = 2;
        @Getter get sum() {
            return this.a + this.b;
        }
        @Getter get diff() {
            return this.b === this.a;
        }
    }
    const state = new Test() as any;
    const scope = state.__scope__ as any;
    t.deepEqual(state.__scope__.$state, { a: 1, b: 2 });
    t.true(state.sum === scope.$getters.sum);
    t.true(scope.$getters.sum === 3);
    t.true(state.diff === scope.$getters.diff);
    t.false(scope.$getters.diff);
});

test('computed', t => {
    let num = 0;
    class Test {
        @State public a = 1;
        @Getter get t() {
            num++;
            return this.a;
        }
    }
    const state = new Test();

    state.t;
    state.t;
    state.t;
    state.a = 2;
    state.t;
    state.t;
    state.t;
    state.a = 5;
    state.t;
    state.t;
    state.t;

    t.is(num, 3);
});

test('Mutation.commit', t => {
    class Test {
        @State public a = 1;
        @State public b = 2;

        public change() {
            Mutation.commit(this, () => {
                this.a = 2;
                this.b = 4;
            });
        }
    }
    const state = new Test();
    state.change();
    t.is(state.a, 2);
    t.is(state.b, 4);
});

test('State.replaceState', t => {
    class Test {
        @State public a = 1;
        @State public b = 2;
        @State public obj = {};
        get jsonString() {
            return Object.assign({}, this, {
                a: 3,
                obj: {
                    c: 4
                }
            });
        }
    }
    const state = new Test();
    State.replaceState(state, state.jsonString);
    t.deepEqual(State.getAllState(state), {
        a: 3,
        b: 2,
        obj: {
            c: 4
        }
    });
});
