import { IServiceClass, IService, IIdentifier } from '../interfaces';

export type IInjectorOption<T extends IService> = {
    identifier: IIdentifier,
    useClass?: IServiceClass<T>,
    useFactory?: () => T,
    useValue?: IService,
    async?: boolean,
    dep?: IIdentifier[]
};

export enum INJECT_TYPE {
    CLASS,
    FACTORY,
    VALUE
}

export class Injector<T extends IService> implements IInjectorOption<T> {

    identifier: IIdentifier;
    useClass?: IServiceClass<T>;
    useFactory?: () => T;
    useValue?: IService;
    async: boolean = false;
    singleton = true;
    dep: IIdentifier[] = [];
    injectorType = INJECT_TYPE.CLASS;

    resolve(): T | null {
        return null;
    }
    bind(identifier: IIdentifier) {
        this.identifier = identifier;
        return this;
    }
    toClass(serviceClass: IServiceClass<T>) {
        this.useClass = serviceClass;
        this.injectorType = INJECT_TYPE.CLASS;
        return this;
    }
    toFactory(serviceFactory: () => T, dep: IIdentifier[] = []) {
        this.useFactory = serviceFactory;
        this.dep = [];
        this.injectorType = INJECT_TYPE.FACTORY;
        return this;
    }
    toValue(service: T) {
        this.useValue = service;
        this.injectorType = INJECT_TYPE.VALUE;
        return;
    }

    useAsync(isAsync = true) {
        this.async = isAsync;
        return this;
    }

}