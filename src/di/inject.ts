import { IConstructor, IIdentifier } from '../state/helper';
import { ClassMetaData } from './class_meta';
import { lazyDecorator } from './lazy';
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
