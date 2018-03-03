import { IConstructor, IIdentifier } from '../state/helper';
import { def } from '../util';
import { ClassMetaData } from './class_meta';
import { DIMetaData } from './di_meta';
export function Inject(identifier: IIdentifier): any {
    return function (target: IConstructor, propertyKey?: string, parameterIndex?: number) {
        const isParamInject = typeof parameterIndex === 'number';
        if (isParamInject) {
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

export function lazyDecorator(_target: any, propertyKey: string, identifier?: IIdentifier) {
    const stateKey: IIdentifier = identifier || propertyKey;
    return {
        get(this: any) {
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
