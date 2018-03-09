import { IClass, IIdentifier } from '../state/helper';
import {
    ClassInjector, FactoryInjector,
    IInjector, IInstanceFactory, ValueInjector
} from './injector';

export class Binding<T> {

    public injectorFactory!: () => IInjector<T>;

    constructor(
        public identifier: IIdentifier
    ) { }

    public toClass(stateClass: IClass<T>) {
        this.injectorFactory = () =>
            new ClassInjector(this.identifier, stateClass);
        return this;
    }

    public toValue(state: T) {
        this.injectorFactory = () =>
            new ValueInjector(this.identifier, state);
        return this;
    }

    public toFactory(factory: IInstanceFactory<T>, deps: IIdentifier[] = []) {
        this.injectorFactory = () =>
            new FactoryInjector(this.identifier, factory, deps);
        return this;
    }

}

export function bind<T>(identifier: IIdentifier) {
    return new Binding<T>(identifier);
}
