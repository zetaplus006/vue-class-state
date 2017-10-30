import { Provider } from './provider';
import { IIdentifier, IServiceClass } from '../service/helper';
import { Service, IService } from '../service/service';
import { assert, hasSymbol } from '../util';
import { createdHook } from '../service/observable';
import { DIMetaData } from './di_meta';

export interface IInjector<T> {
    identifier: IIdentifier;
    isSingleton: Boolean;
    provider: Provider;
    resolve(): T;
}

export type IDeps = IIdentifier[];

export type IServiceFactory<T> = (...arg: any[]) => T;

export class BaseInjector<T> {

    public instance: T;
    public isSingleton: boolean = true;
    public provider: Provider;

    public addDIMeta(instance: T, identifier: IIdentifier) {
        const meta = DIMetaData.get(instance);
        if (meta.hasBeenInjected) {
            return;
        }
        meta.identifier = identifier;
        meta.provider = this.provider;
        this.provider.hooks.forEach(fn => fn(instance, meta));
        meta.hasBeenInjected = true;
    }
}

export class ClassInjector<T> extends BaseInjector<T> implements IInjector<T> {

    constructor(
        public identifier: IIdentifier,
        public isSingleton: boolean,
        private serviceClass: IServiceClass<T>
    ) {
        super();
    }

    resolve(): T {
        if (this.isSingleton) {
            if (!this.instance) {
                this.instance = this.getInstance();
            }
            return this.instance;
        } else {
            return this.getInstance();
        }
    }

    private getInstance() {
        const instance = new this.serviceClass();
        this.addDIMeta(instance, this.identifier);
        return instance;
    }
}

export class ValueInjector<T> extends BaseInjector<T> implements IInjector<T> {

    constructor(
        public identifier: IIdentifier,
        public isSingleton: boolean,
        private service: T
    ) {
        super();
    }

    resolve(): T {
        if (!this.instance) {
            this.instance = this.getInstance();
        }
        return this.instance;
    }

    getInstance() {
        this.addDIMeta(this.service, this.identifier);
        return this.service;
    }

    inTransientScope() {
        assert(false, 'Value injector not support inTransientScope');
        return this;
    }
}

export class FactoryInjector<T> extends BaseInjector<T> implements IInjector<T> {

    constructor(
        public identifier: IIdentifier,
        public isSingleton: boolean,
        private ServiceFactory: IServiceFactory<T>,
        private deps: IDeps
    ) {
        super();
    }

    resolve(): T {
        if (this.isSingleton) {
            if (!this.instance) {
                this.instance = this.getInstance();
            }
            return this.instance;
        } else {
            return this.getInstance();
        }
    }

    private getInstance() {
        const args = this.provider.getAll(this.deps);
        const instance = this.ServiceFactory.apply(null, args) as T;
        this.addDIMeta(instance, this.identifier);
        return instance;
    }

}
