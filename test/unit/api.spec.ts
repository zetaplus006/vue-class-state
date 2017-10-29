import { expect } from 'chai';
import * as Vubx from '../../lib/vubx';

describe('export apis', function () {
    it('export apis', function () {
        const apis = Object.keys(Vubx).sort();
        expect(apis).to.deep.equal(['Service', 'bind', 'created', 'createDecorator', 'lazyInject', 'mutation']);
    });
});
