import { IIdentifier, IService, IServiceClass } from '../interfaces';
import { Service } from '../service/observable';

export interface IInjector<T> {
    identifier: IIdentifier;
    resolve(service?: IService): T;
    inSingletonScope(): void;
    inTransientScope(): void;
}

export type IDeps = IIdentifier[];
export type IServiceFactory<T extends Service> = (...arg: IService[]) => T;

export class BaseInjector<T> {
    protected instance: T;
    protected isSingleton: boolean = true;
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
        private ServiceClass: IServiceClass<T>
    ) {
        super();
    }

    resolve(): T {
        if (this.isSingleton) {
            if (!this.instance) {
                this.instance = new this.ServiceClass();
            }
            return this.instance;
        } else {
            return new this.ServiceClass();
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

    resolve(service: IService): T {
        if (this.inSingletonScope) {
            if (!this.instance) {
                this.instance = this.ServiceFactory();
            }
            return this.instance;
        } else {
            return this.ServiceFactory();
        }
    }
}
