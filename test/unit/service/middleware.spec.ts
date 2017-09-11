import { expect } from 'chai';
import { createDecorator, Service, IService, bind, lazyInject, mutation, IMutation, IVubxDecorator } from '../../../lib/vubx';
const Vue = require('Vue');

const observable: IVubxDecorator = createDecorator(Vue);

describe('middleware plugin', () => {

    const key = 'store';
    const plugin = (service: IService) => {
        service.subscribe({
            before: (m: IMutation, state: Test) => {
                m.payload[0].a = 10;
            },
            after: (m: IMutation, state: Test) => {
                state.count = 20;
            }
        });
    };

    @observable({
        root: true,
        identifier: key,
        plugins: [
            plugin
        ]
    })
    class Test extends Service {

        data = {
            a: 1,
            b: 2
        };

        count = 0;

        @mutation
        change(data, count) {
            Object.assign(this.data, data);
            this.count = count;
        }
    }

    let t = new Test();
    t.change({
        a: 5,
        b: 6
    }, 1);
    it('before run', () => {
        expect(t.data).to.deep.equal({ a: 10, b: 6 });
    });
    it('after run', () => {
        expect(t.count).to.equal(20);
    });

});

describe('global middleware, global plugin', () => {

    const key = 'store';
    const plugin = (service: IService) => {
        service.subscribe({
            before: (m: IMutation, state: any) => {
                m.payload[0].a = 10;
            },
            after: (m: IMutation, state: any) => {
                state.count = 20;
            }
        });
    };

    @observable()
    class ChildrenTest extends Service {
        data = {
            a: 1,
            b: 2
        };

        count = 0;

        @mutation
        change(data, count) {
            Object.assign(this.data, data);
            this.count = count;
        }
    }

    @observable({
        root: true,
        identifier: key,
        plugins: [
            plugin
        ],
        providers: [
            bind<ChildrenTest>('children').toClass(ChildrenTest)
        ]
    })
    class Test extends Service {
        @lazyInject('children')
        chilren: ChildrenTest;
    }

    let t = new Test();
    t.chilren.change({
        a: 5,
        b: 6
    }, 1);
    it('before run', () => {
        expect(t.chilren.data).to.deep.equal({ a: 10, b: 6 });
    });
    it('after run', () => {
        expect(t.chilren.count).to.equal(20);
    });

});