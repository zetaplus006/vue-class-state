import { IIdentifier } from '../service/helper';
import { def } from '../util';
import { ClassMetaData } from './class_meta';
import { DIMetaData } from './di_meta';

export function LazyInject (identifier?: IIdentifier): any;
export function LazyInject (target: any, propertyKey: string): any;
export function LazyInject (option: any, propertyKey?: string): any {
    if (typeof option === 'object' && propertyKey) {
        return createLazyDecorator(option, propertyKey);
    } else {
        return function (target: object, key: string) {
            return createLazyDecorator(target, key, option);
        };
    }
}

function createLazyDecorator (target: any, propertyKey: string, identifier?: IIdentifier) {
    const serviceKey: IIdentifier = identifier || propertyKey;
    const meta = ClassMetaData.get(target);
    meta.injectMeta.set(propertyKey, {
        identifier
    });
    return {
        get (this: any) {
            const service = DIMetaData.get(this).provider.get(serviceKey);
            def(this, propertyKey, {
                value: service,
                enumerable: false,
                configurable: true
            });
            return service;
        },
        enumerable: false,
        configuriable: true
    };
}
