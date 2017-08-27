import { Service } from './observable';
import { IPlugin, IIdentifier, IServiceClass } from '../interfaces';
export declare class Provider {
    private instancesMap;
    private classMap;
    readonly proxy: {};
    readonly instances: [IIdentifier, any][];
    readonly classes: [IIdentifier, any][];
    register<T extends Service>(identifier: IIdentifier, serviceClass: IServiceClass<T>): void;
    push(identifier: IIdentifier, service: Service): void;
    defProxy(identifier: IIdentifier): void;
    getInstance(identifier: IIdentifier): Service;
    removeInstance(identifier: IIdentifier): void;
    checkIdentifier(identifier: IIdentifier): void;
    hasInstance(identifier: IIdentifier): boolean;
    hasClass(identifier: IIdentifier): boolean;
}
export declare function bindClass<T extends Service>(identifier: IIdentifier, serviceClass: IServiceClass<T>): IPlugin;
export declare function bindFactory<T extends Service>(identifier: IIdentifier, serviceFactory: () => T): IPlugin;
export declare function lazyInject(identifier: IIdentifier): PropertyDecorator;
