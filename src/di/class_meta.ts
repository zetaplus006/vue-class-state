import { IConstructor, IIdentifier } from '../state/helper';
import { hideProperty } from '../util';
import { IMap, UseMap } from './map';

export interface IGetters { [key: string]: () => any; }

const classMetaKey = '__meta__';

export class ClassMetaData {

    public static get(target: any): ClassMetaData {
        if (target.constructor.hasOwnProperty(classMetaKey)) {
            return target.constructor[classMetaKey];
        }
        const meta = new ClassMetaData();
        hideProperty(target.constructor, classMetaKey, meta);
        return meta;
    }

    public static addGetterMeta(target: any, key: string) {
        const meta = ClassMetaData.get(target);
        const desc = Object.getOwnPropertyDescriptor(target, key);
        const ctor: IConstructor = target.constructor;
        if (desc && desc.get) {
            meta.getterMeta[key] = desc.get;
            meta.getterKeys.push(key);
            if (meta.constructorMeta.length === 0) {
                meta.constructorMeta.push(ctor);
                trackCtorMeta(ctor, ctor);
            }
        }
    }

    public constructorMeta: IConstructor[] = [];

    public injectPropertyMeta: IMap<string, any> = new UseMap();

    public injectParameterMeta: IIdentifier[] = [];

    // public injectparameterKeys: string[] = [];

    public getterMeta: IGetters = {};

    public getterKeys: string[] = [];

}

function trackCtorMeta(ctor: IConstructor, childCtor: IConstructor) {
    if (ctor === Object) {
        return;
    }
    const baseProto = Object.getPrototypeOf(ctor.prototype);
    const baseCtor = baseProto.constructor;
    const baseMeta = ClassMetaData.get(baseCtor.prototype);
    baseMeta.constructorMeta.push(childCtor);
    trackCtorMeta(baseCtor, childCtor);
}
