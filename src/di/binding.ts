import { IIdentifier, IServiceClass } from '../service/helper';
import {
    ClassInjector, FactoryInjector, IDeps,
    IInjector, IServiceFactory, ValueInjector
} from './injector';

export class Binding<T> {

    public injectorFactory: () => IInjector<T>;

    // private identifier: IIdentifier;
    private isSingleton: boolean = true;

    constructor(
        private identifier: IIdentifier
    ) { }

    public toClass(serviceClass: IServiceClass<T>) {
        this.injectorFactory = () =>
            new ClassInjector(this.identifier, this.isSingleton, serviceClass);
        return this;
    }

    public toValue(service: T) {
        this.injectorFactory = () =>
            new ValueInjector(this.identifier, this.isSingleton, service);
        return this;
    }

    public toFactory(factory: IServiceFactory<T>, deps: IDeps = []) {
        this.injectorFactory = () =>
            new FactoryInjector(this.identifier, this.isSingleton, factory, deps);
        return this;
    }

}

export function bind<T>(identifier: IIdentifier) {
    return new Binding<T>(identifier);
}
