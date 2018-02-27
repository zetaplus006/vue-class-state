import { IIdentifier } from '../state/helper';
import { IMap, UseMap } from './map';

export interface IGetters { [key: string]: { get: () => any }; }
export class ClassMetaData {

    public static get(target: any): ClassMetaData {
        return target.constructor.__meta__ ||
            (target.constructor.__meta__ = new ClassMetaData());
    }

    public static addGetterMeta(target: object, key: string) {
        const meta = ClassMetaData.get(target);
        const desc = Object.getOwnPropertyDescriptor(target, key);
        if (desc && desc.get) {
            meta.getterMeta[key] = { get: desc.get };
            meta.getterKeys.push(key);
        }
    }

    public injectPropertyMeta: IMap<string, any> = new UseMap();

    public injectParameterMeta: IIdentifier[] = [];

    // public injectparameterKeys: string[] = [];

    public getterMeta: IGetters = {};

    public getterKeys: string[] = [];

}
