import { ClassInjector, ValueInjector, FactoryInjector, IDeps, IServiceFactory, IInjector } from './injector';
import { IIdentifier, IServiceClass } from '../service/helper';
import { Service } from '../service/service';

export class Binding<T> {

    public injectorFactory: () => IInjector<T>;

    private identifier: IIdentifier;
    private isSingleton: boolean = true;

    constructor(identifier: IIdentifier) {
        this.identifier = identifier;
    }

    public toClass(serviceClass: IServiceClass<T>) {
        this.injectorFactory = () => new ClassInjector(this.identifier, this.isSingleton, serviceClass);
        return this;
    }

    public toValue(service: T) {
        this.injectorFactory = () => new ValueInjector(this.identifier, this.isSingleton, service);
        return this;
    }

    public toFactory(factory: IServiceFactory<T>, deps: IDeps = []) {
        this.injectorFactory = () => new FactoryInjector(this.identifier, this.isSingleton, factory, deps);
        return this;
    }

    public inSingletonScope(): this {
        this.isSingleton = true;
        return this;
    }

    public inTransientScope(): this {
        this.isSingleton = false;
        return this;
    }

}

export function bind<T>(identifier: IIdentifier) {
    return new Binding<T>(identifier);
}