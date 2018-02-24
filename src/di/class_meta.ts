import { getAllGetters } from '../service/helper';
import { ICreatedHook } from '../service/hook';
import { IMap, UseMap } from './map';

export interface IGetters { [key: string]: { get: () => any }; }

export class ClassMetaData {

    public static get (target: any): ClassMetaData {
        return target.constructor.__meta__ ||
            (target.constructor.__meta__ = new ClassMetaData());
    }

    public static setGetterMeta (target: object) {
        const meta = ClassMetaData.get(target);
        meta.getterMeta = getAllGetters(target) as any;
        meta.getterKeys = Object.keys(meta.getterMeta);
        return meta;
    }

    public injectMeta: IMap<string, any> = new UseMap();

    public getterMeta: IGetters;

    public getterKeys: string[];

    public hookMeta: ICreatedHook;

}
