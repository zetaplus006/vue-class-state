import { ClassInjector, ValueInjector, FactoryInjector, IDeps, IServiceFactory } from './injector';
import { IIdentifier, IServiceClass } from '../service/helper';
import { Service } from '../service/service';

export class Binding<T extends Service> {

    public identifier: IIdentifier;

    constructor(identifier: IIdentifier) {
        this.identifier = identifier;
    }

    public toClass(serviceClass: IServiceClass<T>) {
        return new ClassInjector(this.identifier, serviceClass);
    }

    public toValue(service: T) {
        return new ValueInjector(this.identifier, service);
    }

    public toFactory(factory: IServiceFactory<T>, deps: IDeps = []) {
        return new FactoryInjector(this.identifier, factory, deps);
    }
}

export function bind<T extends Service>(identifier: IIdentifier) {
    return new Binding<T>(identifier);
}