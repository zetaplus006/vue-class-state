import { def } from '../util';
import { IIdentifier } from '../service/helper';
import { IService } from '../service/service';
import { ClassMetaData } from './class_meta';
import { DIMetaData } from './di_meta';

export function lazyInject(identifier?: IIdentifier): PropertyDecorator {
    return function(target: any, propertyKey: string): any {
        const serviceKey: IIdentifier = identifier || propertyKey;
        const meta = ClassMetaData.get(target);
        meta.propertyMeta.set(propertyKey, {
            identifier
        });
        return {
            get: function(this: IService) {
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
    };
}