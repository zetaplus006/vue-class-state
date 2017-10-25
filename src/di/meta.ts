
export class MetaData {

    constructor(
        public target: any
    ) { }

    public propertyMeta: Map<string, any> = new Map();

    static getMetaData(target: any): MetaData {
        return target.constructor.__meta__ ||
            (target.constructor.__meta__ = new MetaData(target));
    }
}