import { IDeps, IServiceFactory, IInjector } from './injector';
import { IIdentifier, IServiceClass } from '../service/helper';
import { Service } from '../service/service';
export declare class Binding<T> {
    identifier: IIdentifier;
    private isSingleton;
    injectorFactory: () => IInjector<T>;
    constructor(identifier: IIdentifier);
    toClass(serviceClass: IServiceClass<T>): this;
    toValue(service: T): this;
    toFactory(factory: IServiceFactory<T>, deps?: IDeps): this;
    inSingletonScope(): this;
    inTransientScope(): this;
}
export declare function bind<T extends Service>(identifier: IIdentifier): Binding<T>;
