import { def } from '../util';
import { IIdentifier, appendServiceChild } from '../service/helper';
import { IService } from '../service/service';

export function lazyInject(identifier?: IIdentifier): PropertyDecorator {
    return function(target: any, propertyKey: string | symbol): any {
        const serviceKey: IIdentifier = identifier || propertyKey;
        return {
            get: function(this: IService) {
                const service = this.__.provider.get(serviceKey);
                appendServiceChild(this, propertyKey as any, service, serviceKey);
                def(this, propertyKey, {
                    value: service
                });
                return service;
            },
            enumerable: true,
            configuriable: true
        };
    };
}