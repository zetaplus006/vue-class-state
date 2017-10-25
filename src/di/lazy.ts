import { def } from '../util';
import { IIdentifier, appendServiceChild } from '../service/helper';
import { IService } from '../service/service';
import { MetaData } from './meta';

export function lazyInject(identifier?: IIdentifier): PropertyDecorator {
    return function (target: any, propertyKey: string): any {
        const serviceKey: IIdentifier = identifier || propertyKey;
        const meta = MetaData.getMetaData(target);
        meta.propertyMeta.set(propertyKey, {
            identifier
        });
        return {
            get: function (this: IService) {
                const service = this.__scope__.provider.get(serviceKey);
                appendServiceChild(this, propertyKey as any, service, serviceKey);
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