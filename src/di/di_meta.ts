import { IIdentifier } from '../state/helper';
import { hideProperty } from '../util';
import { Provider } from './provider';

export const meta_key = '__meta__';

export class DIMetaData {
    public static get(ctx: any): DIMetaData {
        if (!ctx[meta_key]) {
            hideProperty(ctx, meta_key, new DIMetaData());
        }
        return ctx[meta_key];
    }

    public identifier: IIdentifier;
    public hasBeenInjected: boolean = false;
    public provider: Provider;

}
