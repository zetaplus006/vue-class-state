import { IDeps, IServiceFactory, IInjector } from './injector';
import { IIdentifier, IServiceClass } from '../service/helper';
export declare class Binding<T> {
    injectorFactory: () => IInjector<T>;
    private identifier;
    private isSingleton;
    constructor(identifier: IIdentifier);
    toClass(serviceClass: IServiceClass<T>): this;
    toValue(service: T): this;
    toFactory(factory: IServiceFactory<T>, deps?: IDeps): this;
    inSingletonScope(): this;
    inTransientScope(): this;
}
export declare function bind<T>(identifier: IIdentifier): Binding<T>;
