import { IClass, IIdentifier } from '../state/helper';
import { ClassMetaData } from './class_meta';
import { DIMetaData } from './di_meta';
import { Provider } from './provider';

export interface IInjector<T> {
    identifier: IIdentifier;
    provider: Provider;
    resolve(): T;
}

export type IInstanceFactory<T> = (...arg: any[]) => T;

export abstract class BaseInjector<T> {

    public instance!: T;
    public provider!: Provider;

    public resolve(): T {
        return this.instance || (this.instance = this.getInstance());
    }

    public addDIMeta(instance: T, identifier: IIdentifier) {
        const meta = DIMetaData.get(instance);
        if (meta.hasBeenInjected) {
            return;
        }
        meta.identifier = identifier;
        meta.provider = this.provider;
        this.provider.hooks.forEach((fn) => fn(instance, meta));
        meta.hasBeenInjected = true;
    }

    protected abstract getInstance(): T;
}

export class ClassInjector<T> extends BaseInjector<T> implements IInjector<T> {

    constructor(
        public identifier: IIdentifier,
        public stateClass: IClass<T>
    ) {
        super();
    }

    public getInstance() {
        const instance = resolveClassInstance<T>(this.provider, this);
        this.addDIMeta(instance, this.identifier);
        return instance;
    }
}

export class ValueInjector<T> extends BaseInjector<T> implements IInjector<T> {

    constructor(
        public identifier: IIdentifier,
        private state: T
    ) {
        super();
    }

    public getInstance() {
        this.addDIMeta(this.state, this.identifier);
        return this.state;
    }

}

export class FactoryInjector<T> extends BaseInjector<T> implements IInjector<T> {

    constructor(
        public identifier: IIdentifier,
        private stateFactory: IInstanceFactory<T>,
        private deps: IIdentifier[]
    ) {
        super();
    }

    public getInstance() {
        const args = this.provider.getAll(this.deps);
        const instance = this.stateFactory.apply(null, args) as T;
        this.addDIMeta(instance, this.identifier);
        return instance;
    }

}

export function resolveClassInstance<T>(provider: Provider, injector: ClassInjector<T>) {
    const classMeta = ClassMetaData.get(injector.stateClass.prototype);
    const parameterMeta = classMeta.injectParameterMeta;
    const args = provider.getAll(parameterMeta);
    return new injector.stateClass(...args);
}
