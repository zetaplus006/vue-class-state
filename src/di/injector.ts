import { IIdentifier, IServiceClass } from '../service/helper';
import { assert } from '../util';
import { DIMetaData } from './di_meta';
import { Provider } from './provider';

export interface IInjector<T> {
    identifier: IIdentifier;
    isSingleton: boolean;
    provider: Provider;
    resolve (): T;
}

export type IDeps = IIdentifier[];

export type IServiceFactory<T> = (...arg: any[]) => T;

export class BaseInjector<T> {

    public instance: T;
    public isSingleton: boolean = true;
    public provider: Provider;

    public addDIMeta (instance: T, identifier: IIdentifier) {
        const meta = DIMetaData.get(instance);
        if (meta.hasBeenInjected) {
            return;
        }
        meta.identifier = identifier;
        meta.provider = this.provider;
        this.provider.hooks.forEach((fn) => fn(instance, meta));
        meta.hasBeenInjected = true;
    }
}

export class ClassInjector<T> extends BaseInjector<T> implements IInjector<T> {

    constructor (
        public identifier: IIdentifier,
        public isSingleton: boolean,
        private serviceClass: IServiceClass<T>
    ) {
        super();
    }

    public resolve (): T {
        if (this.isSingleton) {
            if (!this.instance) {
                this.instance = this.getInstance();
            }
            return this.instance;
        } else {
            return this.getInstance();
        }
    }

    private getInstance () {
        const instance = new this.serviceClass();
        this.addDIMeta(instance, this.identifier);
        return instance;
    }
}

export class ValueInjector<T> extends BaseInjector<T> implements IInjector<T> {

    constructor (
        public identifier: IIdentifier,
        public isSingleton: boolean,
        private service: T
    ) {
        super();
    }

    public resolve (): T {
        if (!this.instance) {
            this.instance = this.getInstance();
        }
        return this.instance;
    }

    public getInstance () {
        this.addDIMeta(this.service, this.identifier);
        return this.service;
    }

    public inTransientScope () {
        assert(false, 'Value injector not support inTransientScope');
        return this;
    }
}

export class FactoryInjector<T> extends BaseInjector<T> implements IInjector<T> {

    constructor (
        public identifier: IIdentifier,
        public isSingleton: boolean,
        private ServiceFactory: IServiceFactory<T>,
        private deps: IDeps
    ) {
        super();
    }

    public resolve (): T {
        if (this.isSingleton) {
            if (!this.instance) {
                this.instance = this.getInstance();
            }
            return this.instance;
        } else {
            return this.getInstance();
        }
    }

    private getInstance () {
        const args = this.provider.getAll(this.deps);
        const instance = this.ServiceFactory.apply(null, args) as T;
        this.addDIMeta(instance, this.identifier);
        return instance;
    }

}
