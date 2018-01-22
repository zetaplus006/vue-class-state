import { ICreatedHook } from '../service/hook';
import { getAllGetters } from '../service/helper';
import { IMap, UseMap } from './map'

export type IGetters = { [key: string]: { get: () => any } };

export class ClassMetaData {

    public injectMeta: IMap<string, any> = new UseMap();

    public getterMeta: IGetters;

    public getterKeys: string[];

    public hookMeta: ICreatedHook;

    static get (target: any): ClassMetaData {
        return target.constructor.__meta__ ||
            (target.constructor.__meta__ = new ClassMetaData());
    }

    static setGetterMeta (target: Object) {
        const meta = ClassMetaData.get(target);
        meta.getterMeta = getAllGetters(target) as any;
        meta.getterKeys = Object.keys(meta.getterMeta);
        return meta;
    }
}