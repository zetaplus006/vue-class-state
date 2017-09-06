import { expect } from 'chai';
import * as Vubx from '../../lib/vubx';

/* const { expect } = require('chai');
const Vubx = require('../../'); */
describe('export apis', function() {
    it('export apis', function() {
        const apis = Object.keys(Vubx).sort();
        // console.log(apis);
        expect(apis).to.deep.equal(['Service', 'bind', 'createDecorator', 'lazyInject', 'mutation']);
    });
});
