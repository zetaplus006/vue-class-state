import { IIdentifier } from '../service/helper';
import { Provider } from './provider';
export declare const meta_key = "__meta__";
export declare class DIMetaData {
    identifier: IIdentifier;
    hasBeenInjected: boolean;
    provider: Provider;
    static get(ctx: any): DIMetaData;
}
export declare function addDIMeta(ctx: any): void;
