import { IConstructor, IIdentifier } from '../state/helper';
import { checkScope } from '../state/observable';
import { def } from '../util';
import { ClassMetaData } from './class_meta';
import { DIMetaData } from './di_meta';
export function Inject(identifier: IIdentifier): any {
    return function (target: IConstructor, propertyKey?: string, parameterIndex?: number) {
        const isParam = typeof parameterIndex === 'number';
        if (isParam) {
            setParamsMeta(target, parameterIndex!, identifier);
        } else {
            return lazyDecorator(target, propertyKey!, identifier);
        }
    };
}

export function setParamsMeta(target: IConstructor, index: number, identifier: IIdentifier): void {
    const classMeta = ClassMetaData.get(target.prototype);
    classMeta.injectParameterMeta[index] = identifier;
}

export function lazyDecorator(target: any, propertyKey: string, identifier?: IIdentifier) {
    const stateKey: IIdentifier = identifier || propertyKey;
    const meta = ClassMetaData.get(target);
    meta.injectPropertyMeta.set(propertyKey, {
        identifier
    });
    return {
        get(this: any) {
            checkScope(this, target);
            const state = DIMetaData.get(this).provider.get(stateKey);
            def(this, propertyKey, {
                value: state,
                enumerable: false,
                configurable: true
            });
            return state;
        },
        enumerable: false,
        configuriable: true
    };
}
