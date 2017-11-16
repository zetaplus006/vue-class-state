import { ICreatedHook } from '../service/hook';
export declare class ClassMetaData {
    target: any;
    constructor(target: any);
    propertyMeta: Map<string, any>;
    hookMeta: ICreatedHook;
    static get(target: any): ClassMetaData;
}
