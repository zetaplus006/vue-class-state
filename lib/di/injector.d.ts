import { Provider } from './provider';
import { IIdentifier, IServiceClass } from '../service/helper';
export interface IInjector<T> {
    identifier: IIdentifier;
    isSingleton: Boolean;
    provider: Provider;
    resolve(): T;
}
export declare type IDeps = IIdentifier[];
export declare type IServiceFactory<T> = (...arg: any[]) => T;
export declare class BaseInjector<T> {
    instance: T;
    isSingleton: boolean;
    provider: Provider;
    addDIMeta(instance: T, identifier: IIdentifier): void;
}
export declare class ClassInjector<T> extends BaseInjector<T> implements IInjector<T> {
    identifier: IIdentifier;
    isSingleton: boolean;
    private serviceClass;
    constructor(identifier: IIdentifier, isSingleton: boolean, serviceClass: IServiceClass<T>);
    resolve(): T;
    private getInstance();
}
export declare class ValueInjector<T> extends BaseInjector<T> implements IInjector<T> {
    identifier: IIdentifier;
    isSingleton: boolean;
    private service;
    constructor(identifier: IIdentifier, isSingleton: boolean, service: T);
    resolve(): T;
    getInstance(): T;
    inTransientScope(): this;
}
export declare class FactoryInjector<T> extends BaseInjector<T> implements IInjector<T> {
    identifier: IIdentifier;
    isSingleton: boolean;
    private ServiceFactory;
    private deps;
    constructor(identifier: IIdentifier, isSingleton: boolean, ServiceFactory: IServiceFactory<T>, deps: IDeps);
    resolve(): T;
    private getInstance();
}
