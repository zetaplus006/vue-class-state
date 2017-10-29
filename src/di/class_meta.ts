import { ICreatedHook } from '../service/hook';

export class ClassMetaData {

    constructor(
        public target: any
    ) { }

    public propertyMeta: Map<string, any> = new Map();

    public hookMeta: ICreatedHook;

    static get(target: any): ClassMetaData {
        return target.constructor.__meta__ ||
            (target.constructor.__meta__ = new ClassMetaData(target));
    }
}