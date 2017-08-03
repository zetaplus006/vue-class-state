import Vue from 'vue';
import { assert, def } from '../util';
import { Service, appendServiceChild } from './observable';
import { IInjector, IIentifier, IServiceClass } from '../interfaces';

export function createProvider(service: Service) {
    return (service.__.provider as Provider).proxy;
}

export function lazyInject<T extends Service>(
    key: keyof T,
    identifier: IIentifier,
    serviceClass: IServiceClass
): IInjector {
    return function resolve(parent: T) {
        const provider = parent.getProvider();
        provider.register(identifier, serviceClass);
        def(parent, key, {
            get: () => {
                let instance;
                if (!provider.hasInstance(identifier)) {
                    instance = provider.getInstance(identifier);
                    appendServiceChild(parent, key, instance as Service, identifier);
                }
                return provider.getInstance(identifier);
            },
            enumerable: true,
            configurable: true
        });
    };
}

export class Provider {
    // instances: { [identifier: IIentifier]: Service } = {};
    private instancesMap: Map<IIentifier, Service> = new Map();

    private classMap: Map<IIentifier, IServiceClass> = new Map();

    // for vue provide
    public readonly proxy: {} = {};

    get instances() {
        return Array.from(this.instancesMap);
    }

    get classes() {
        return Array.from(this.classMap);
    }

    register(identifier: IIentifier, serviceClass: IServiceClass) {
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
            assert(!this.classMap.has(identifier),
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
