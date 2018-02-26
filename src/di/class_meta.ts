import { getAllGetters } from '../state/helper';
import { ICreatedHook } from '../state/hook';
import { IMap, UseMap } from './map';

export interface IGetters { [key: string]: { get: () => any }; }

export class ClassMetaData {

    public static get(target: any): ClassMetaData {
        return target.constructor.__meta__ ||
            (target.constructor.__meta__ = new ClassMetaData());
    }

    public static collectGetterMeta(target: object) {
        const meta = ClassMetaData.get(target);
        meta.getterMeta = getAllGetters(target) as any;
        meta.getterKeys = Object.keys(meta.getterMeta);
        return meta;
    }

    public static addGetterMeta(target: object, key: string) {
        const meta = ClassMetaData.get(target);
        const desc = Object.getOwnPropertyDescriptor(target, key);
        if (desc && desc.get) {
            meta.getterMeta[key] = { get: desc.get };
            meta.getterKeys.push(key);
        }
    }

    public injectMeta: IMap<string, any> = new UseMap();

    public getterMeta: IGetters = {};

    public getterKeys: string[] = [];

    public hookMeta: ICreatedHook;

}
