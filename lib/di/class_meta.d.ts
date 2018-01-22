import { ICreatedHook } from '../service/hook';
import { IMap } from './map';
export declare type IGetters = {
    [key: string]: {
        get: () => any;
    };
};
export declare class ClassMetaData {
    injectMeta: IMap<string, any>;
    getterMeta: IGetters;
    getterKeys: string[];
    hookMeta: ICreatedHook;
    static get(target: any): ClassMetaData;
    static setGetterMeta(target: Object): ClassMetaData;
}
