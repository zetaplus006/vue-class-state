import { IServiceClass, IService, IIdentifier } from '../interfaces';
import { Provider } from './provider';

export enum INJECT_TYPE {
    CLASS,
    FACTORY,
    VALUE
}

export class Injector<T extends IService> {

    identifier: IIdentifier;
    instaance: T;
    useClass?: IServiceClass<T>;
    useFactory?: (...arg: IService[]) => T;
    useValue?: T;
    async: boolean = false;
    singleton = true;
    dep: IIdentifier[] = [];
    injectorType: INJECT_TYPE = INJECT_TYPE.CLASS;

    resolve(provider: Provider): T | null {
        let instance = null;
        switch (this.injectorType) {
            case INJECT_TYPE.CLASS:
                instance = this.useClass && new this.useClass();
                break;
            case INJECT_TYPE.VALUE:
                instance = this.useValue;
                break;
            case INJECT_TYPE.FACTORY:
                instance = this.useFactory && this.useFactory();
                break;
        }
        return instance || null;
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

export function bind<T extends IService>(identifier: IIdentifier) {
    return new Injector<T>().bind(identifier);
}
