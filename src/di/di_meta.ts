import { IConstructor, IIdentifier } from '../service/helper';
import { expect } from 'chai';
import { Provider } from './provider';
import { def } from '../util';

export const meta_key = '__meta__';

export class DIMetaData {
    identifier: IIdentifier;
    hasBeenInjected: boolean = false;
    provider: Provider;

    static get(ctx: any): DIMetaData {
        if (!ctx[meta_key]) {
            addDIMeta(ctx);
        }
        return ctx[meta_key];
    }
}

export function addDIMeta(ctx: any) {
    def(ctx, meta_key, {
        value: new DIMetaData(),
        enumerable: false
    });
}
