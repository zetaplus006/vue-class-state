import { IIdentifier, IstateClass } from '../state/helper';
import {
    ClassInjector, FactoryInjector,
    IInjector, IstateFactory, ValueInjector
} from './injector';

export class Binding<T> {

    public injectorFactory: () => IInjector<T>;

    // private identifier: IIdentifier;
    private isSingleton: boolean = true;

    constructor(
        private identifier: IIdentifier
    ) { }

    public toClass(stateClass: IstateClass<T>) {
        this.injectorFactory = () =>
            new ClassInjector(this.identifier, this.isSingleton, stateClass);
        return this;
    }

    public toValue(state: T) {
        this.injectorFactory = () =>
            new ValueInjector(this.identifier, this.isSingleton, state);
        return this;
    }

    public toFactory(factory: IstateFactory<T>, deps: IIdentifier[] = []) {
        this.injectorFactory = () =>
            new FactoryInjector(this.identifier, this.isSingleton, factory, deps);
        return this;
    }

}

export function bind<T>(identifier: IIdentifier) {
    return new Binding<T>(identifier);
}
