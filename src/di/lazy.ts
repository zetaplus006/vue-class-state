import { IIdentifier, IService } from '../interfaces';
import { appendServiceChild } from '../service/observable';

export function lazyInject(identifier: IIdentifier): PropertyDecorator {
    return function (target: any, propertyKey: PropertyKey): any {
        return {
            get: function (this: IService) {
                const service = this.getProvider().get(identifier);
                appendServiceChild(this, propertyKey as any, service, identifier);
                delete this[identifier];
                this[identifier] = service;
                return service;
            },
            enumerable: true,
            configuriable: true
        };
    };
}