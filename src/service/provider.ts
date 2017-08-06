import Vue from 'vue';
import { assert, def } from '../util';
import { Service, appendServiceChild } from './observable';
import { IPlugin, IIentifier, IServiceClass } from '../interfaces';
export function createProvider(service: Service) {
    return (service.__.provider as Provider).proxy;
}

export function lazyInject<T extends Service>(
    key: keyof T,
    identifier: IIentifier
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
}

export function inject(identifier: IIentifier): PropertyDecorator {
    return function (targe: any, propertyKey: string) {
        def(targe, propertyKey, {
            get: () => {
                return 'key';
            }
        });
    };
}

export function bindClass<T extends Service>(
    identifier: IIentifier,
    serviceClass: IServiceClass<T>
): IPlugin {
    return function registerClass(parent: Service) {
        parent.getProvider().register(identifier, serviceClass);
    };
}

export function bindFactory<T extends Service>(
    identifier: IIentifier,
    serviceFactory: () => T
): IPlugin {
    return function registerFactory(parent: Service) {
        parent.getProvider().push(identifier, serviceFactory());
    };
}

export class Provider {
    // instances: { [identifier: IIentifier]: Service } = {};
    private instancesMap: Map<IIentifier, any> = new Map();

    private classMap: Map<IIentifier, any> = new Map();

    // for vue provide
    public readonly proxy: {} = {};

    get instances() {
        return Array.from(this.instancesMap);
    }

    get classes() {
        return Array.from(this.classMap);
    }

    register<T extends Service>(identifier: IIentifier, serviceClass: IServiceClass<T>) {
        this.checkIdentifier(identifier);
        this.classMap.set(identifier, serviceClass);
        this.defProxy(identifier);
    }

    push(identifier: IIentifier, service: Service) {
        this.checkIdentifier(identifier);
        this.instancesMap.set(identifier, service);
        this.defProxy(identifier);
    }

    defProxy(identifier: IIentifier) {
        def(this.proxy, identifier, {
            get: () => {
                return this.getInstance(identifier);
            },
            enumerable: true,
            configurable: true
        });
    }

    getInstance(identifier: IIentifier) {
        if (!this.instancesMap.has(identifier)) {
            const serviceClass = this.classMap.get(identifier);
            if (process.env.NODE_ENV !== 'production') {
                assert(serviceClass, `${identifier.toString()} can not find this class`);
            }
            serviceClass && this.instancesMap.set(identifier, new serviceClass());
        }
        return this.instancesMap.get(identifier);
    }

    checkIdentifier(identifier: IIentifier) {
        if (process.env.NODE_ENV !== 'production') {
            assert(!this.classMap.has(identifier)
                && !this.instancesMap.has(identifier),
                `The identifier ${identifier.toString()} has been repeated`);
        }
    }

    hasInstance(identifier: IIentifier) {
        return this.instancesMap.has(identifier);
    }

    hasClass(identifier: IIentifier) {
        return this.classMap.has(identifier);
    }
}
