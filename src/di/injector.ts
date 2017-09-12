import { Provider } from './provider';
import { IIdentifier, IServiceClass } from '../service/helper';
import { Service, IService } from '../service/service';
import { assert } from '../util';
import { createdHook } from '../service/observable';

export interface IInjector<T> {
    identifier: IIdentifier;
    dependentRoot: IService;
    provider: Provider;
    resolve(): T;
    inSingletonScope(): void;
    inTransientScope(): void;
}

export type IDeps = IIdentifier[];

export type IServiceFactory<T extends Service> = (...arg: IService[]) => T;

export class BaseInjector<T extends Service> {

    protected instance: T;
    protected isSingleton: boolean = true;
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

    protected setDep(instance: T, identifier: IIdentifier) {
        instance.__.identifier = identifier;
        instance.__.$root = this.dependentRoot;
        createdHook(instance, instance.__.vubxOption);
    }
}

export class ClassInjector<T extends IService> extends BaseInjector<T> implements IInjector<T> {

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

export class ValueInjector<T extends IService> extends BaseInjector<T> implements IInjector<T> {

    constructor(
        public identifier: IIdentifier,
        private service: T
    ) {
        super();
    }

    resolve(): T {
        this.setDep(this.service, this.identifier);
        return this.service;
    }

    inTransientScope() {
        assert(false, 'Value injector not support inTransientScope');
        return this;
    }
}

export class FactoryInjector<T extends IService> extends BaseInjector<T> implements IInjector<T> {

    constructor(
        public identifier: IIdentifier,
        private ServiceFactory: IServiceFactory<T>,
        private deps: IDeps
    ) {
        super();
    }

    resolve(): T {
        if (this.inSingletonScope) {
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
