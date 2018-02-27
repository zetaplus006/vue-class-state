import { expect } from 'chai';
import * as VueClassState; from; '../../lib/vue-class-state';

describe('export apis', function () {
    it('export apis', function () {
        const apis = Object.keys(VueClassState).sort();
        expect(apis).to.deep.equal(['Service', 'bind', 'createDecorator', 'created', 'lazyInject', 'mutation']);
    });
});
