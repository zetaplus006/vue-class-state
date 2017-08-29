import Vue from 'vue';
import { assert, def } from '../util';
import { Service, appendServiceChild } from './observable';
import { IPlugin, IIdentifier, IServiceClass } from '../interfaces';
import { Injector } from './injector';

export class Provider {
    // instances: { [identifier: IIentifier]: Service } = {};
    private instancesMap: Map<IIdentifier, any> = new Map();

    private classMap: Map<IIdentifier, any> = new Map();

    private injectorMap: Map<IIdentifier, Injector<any>> = new Map();

    // for vue provide
    public readonly proxy: {} = {};

    get instances() {
        return Array.from(this.instancesMap);
    }

    get classes() {
        return Array.from(this.classMap);
    }


    register<T extends Service>(identifier: IIdentifier, serviceClass: IServiceClass<T>) {
        this.checkIdentifier(identifier);
        this.classMap.set(identifier, serviceClass);
        this.defProxy(identifier);
    }

    push(identifier: IIdentifier, service: Service) {
        this.checkIdentifier(identifier);
        this.instancesMap.set(identifier, service);
        this.defProxy(identifier);
    }

    defProxy(identifier: IIdentifier) {
        def(this.proxy, identifier, {
            get: () => {
                return this.getInstance(identifier);
            },
            enumerable: true,
            configurable: true
        });
    }

    getInstance(identifier: IIdentifier): Service {
        if (!this.instancesMap.has(identifier)) {
            const serviceClass = this.classMap.get(identifier);
            if (process.env.NODE_ENV !== 'production') {
                assert(serviceClass, `${identifier.toString()} can not find this class`);
            }
            serviceClass && this.instancesMap.set(identifier, new serviceClass());
        }
        return this.instancesMap.get(identifier);
    }

    removeInstance(identifier: IIdentifier) {
        if (process.env.NODE_ENV !== 'production') {
            assert(this.instancesMap.has(identifier),
                `Can not find this instance : identifier[${identifier.toString()}]`);
        }
        this.instancesMap.delete(identifier);
    }

    checkIdentifier(identifier: IIdentifier) {
        if (process.env.NODE_ENV !== 'production') {
            assert(!this.classMap.has(identifier)
                && !this.instancesMap.has(identifier),
                `The identifier ${identifier.toString()} has been repeated`);
        }
    }

    hasInstance(identifier: IIdentifier) {
        return this.instancesMap.has(identifier);
    }

    hasClass(identifier: IIdentifier) {
        return this.classMap.has(identifier);
    }
}

export function bindClass<T extends Service>(
    identifier: IIdentifier,
    serviceClass: IServiceClass<T>
): IPlugin {
    return function registerClass(parent: Service) {
        parent.getProvider().register(identifier, serviceClass);
    };
}

export function bindFactory<T extends Service>(
    identifier: IIdentifier,
    serviceFactory: () => T
): IPlugin {
    return function registerFactory(parent: Service) {
        parent.getProvider().push(identifier, serviceFactory());
    };
}

export function bindValue<T extends Service>(identifier: IIdentifier, service: T): IPlugin {
    return function registerValue(parent: Service) {
        parent.getProvider().push(identifier, service);
    };
}

export function bindAsync<T extends Service>(identifier: IIdentifier, asyncBinding: IAsyncBinding<T>) {
    return function registerAsync(parent: Service) {
        // parent.getProvider().push(identifier, service);
    };
}

export type IAsyncBinding<T extends Service> = (
    resolve: (c: IESModule<IServiceClass<T>>) => void,
    reject: (reason?: any) => void
) => Promise<IESModule<IServiceClass<T>>>;

export type IESModule<T> = {
    __esModule: boolean,
    default: T
};
/* export function lazyInject<T extends Service>(
    key: keyof T,
    identifier: IIdentifier
): IPlugin {
    return function resolve(parent: T) {
        let instance: Service;
        def(parent, key, {
            get: () => {
                if (instance) {
                    return instance;
                }
                const provider = parent.getProvider();
                instance = provider.getInstance(identifier);
                appendServiceChild(parent, key, instance, identifier);
                return instance;
            },
            enumerable: true,
            configurable: true
        });
    };
} */

export function lazyInject(identifier: IIdentifier): PropertyDecorator {
    return function (targe: any, propertyKey: string, desc?: PropertyDescriptor): any {
        let instance: Service;
        const getter = function (this: Vue) {
            if (instance) {
                return instance;
            }
            const provider = this.$service.getProvider();
            instance = provider.getInstance(identifier);
            appendServiceChild(this.$service, propertyKey as any, instance, identifier);
            return instance;
        };
        if (desc) {
            // for es6 decorator
            desc.get = getter;
            return desc;
        }
        // for ts decorator
        return {
            get: getter,
            set() { },
            enumerable: true,
            configurable: true
        };
    };
}
