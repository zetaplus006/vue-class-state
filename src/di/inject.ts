import Vue from 'vue';
import { IClass, IIdentifier } from '../state/helper';
import { def } from '../util';
import { ClassMetaData } from './class_meta';
import { DIMetaData } from './di_meta';
export function Inject(identifier: IIdentifier): any {
    return function (target: IClass | object, propertyKey?: string, parameterIndex?: number) {
        if (typeof parameterIndex === 'number') {
            setParamsMeta(target as IClass, parameterIndex!, identifier);
        } else {
            if (target instanceof Vue) {
                injectIntoComponent(target, propertyKey!, identifier);
            } else {
                return lazyDecorator(propertyKey!, identifier);
            }
        }
    };
}

export function setParamsMeta(target: IClass, index: number, identifier: IIdentifier): void {
    const classMeta = ClassMetaData.get(target.prototype);
    classMeta.injectParameterMeta[index] = identifier;
}

export function lazyDecorator(propertyKey: string, identifier?: IIdentifier) {
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

/**
 * change from https://github.com/vuejs/vue-class-component/blob/master/src/util.ts#L19
 * and https://github.com/kaorun343/vue-property-decorator/blob/master/src/vue-property-decorator.ts#L19
 */
export function injectIntoComponent(proto: any, propertyKey: string, identifier: IIdentifier) {
    const Ctor = proto.constructor;
    if (!Ctor.__decorators__) {
        Ctor.__decorators__ = [];
    }
    const factory = (option: any, key: string) => {
        if (option.inject === undefined) {
            option.inject = {};
        }
        if (!Array.isArray(option.inject)) {
            option.inject[key] = identifier;
        }
    };
    Ctor.__decorators__.push((options: any) => factory(options, propertyKey));
}
