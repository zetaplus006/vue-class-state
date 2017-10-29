import { Provider } from './provider';
import { IIdentifier, IServiceClass } from '../service/helper';
import { Service, IService } from '../service/service';
import { assert, hasSymbol } from '../util';
import { createdHook } from '../service/observable';
import { DIMetaData } from './di_meta';

export interface IInjector<T> {
    identifier: IIdentifier;
    isSingleton: Boolean;
    dependentRoot: IService;
    provider: Provider;
    resolve(): T;
    inSingletonScope(): void;
    inTransientScope(): void;
}

export type IDeps = IIdentifier[];

export type IServiceFactory<T> = (...arg: any[]) => T;

export class BaseInjector<T> {

    public instance: T;
    public isSingleton: boolean = true;
    public dependentRoot: IService;
    public provider: Provider;

    public inSingletonScope(): this {
        this.isSingleton = true;
        return this;
    }
    public inTransientScope(): this {
        this.isSingleton = false;
        return this;
    }

    public setDep(instance: T, identifier: IIdentifier) {
        const meta = DIMetaData.get(instance);
        if (meta.hasBeenInjected) {
            return;
        }
        meta.identifier = identifier;
        meta.provider = this.provider;
        // if (instance instanceof Service) {
        //     instance.__scope__.$root = this.dependentRoot;
        //     createdHook(instance, instance.__scope__.vubxOption);
        // }
        this.provider.hooks.forEach(fn => fn(instance, meta));
        meta.hasBeenInjected = true;
    }
}

export class ClassInjector<T> extends BaseInjector<T> implements IInjector<T> {

    constructor(
        public identifier: IIdentifier,
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
        this.setDep(instance, this.identifier);
        return instance;
    }
}

export class ValueInjector<T> extends BaseInjector<T> implements IInjector<T> {

    constructor(
        public identifier: IIdentifier,
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
        this.setDep(this.service, this.identifier);
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
        this.setDep(instance, this.identifier);
        return instance;
    }

}
