import test from 'ava';
import * as VueClassState from '../../lib/vue-class-state.common';

test('apis', (t) => {
    const apis = Object.keys(VueClassState).sort();
    t.deepEqual(apis, ['Container', 'Getter', 'Inject', 'Mutation', 'State', 'bind']);
});
