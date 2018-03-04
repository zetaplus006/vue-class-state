import { IIdentifier } from '../state/helper';
import { def } from '../util';
import { Provider } from './provider';

export const meta_key = '__meta__';

export class DIMetaData {
    public static get(ctx: any): DIMetaData {
        if (!ctx[meta_key]) {
            addDIMeta(ctx);
        }
        return ctx[meta_key];
    }

    public identifier: IIdentifier;
    public hasBeenInjected: boolean = false;
    public provider: Provider;

}

export function addDIMeta(ctx: any) {
    def(ctx, meta_key, {
        value: new DIMetaData(),
        enumerable: false
    });
}
