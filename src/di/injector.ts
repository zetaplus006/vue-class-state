import { Provider } from './provider';
import { IIdentifier, IServiceClass } from '../service/helper';
import { Service, IService } from '../service/service';

export interface IInjector<T> {
    identifier: IIdentifier;
    provider: Provider;
    resolve(): T;
    inSingletonScope(): void;
    inTransientScope(): void;
}

export type IDeps = IIdentifier[];

export type IServiceFactory<T extends Service> = (...arg: IService[]) => T;

export class BaseInjector<T> {
    protected instance: T;
    protected isSingleton: boolean = true;
    provider: Provider;
    public inSingletonScope(): this {
        this.isSingleton = true;
        return this;
    }
    public inTransientScope(): this {
        this.isSingleton = false;
        return this;
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
                this.instance = new this.serviceClass();
            }
            return this.instance;
        } else {
            return new this.serviceClass();
        }
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
        return this.service;
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
        return this.ServiceFactory.apply(null, args);
    }

}
