import Vue from 'vue';
import { assert, def } from '../util';
import { Service } from './observable';
import { IInjector, IIentifier, IServiceClass } from '../interfaces';
export function createProvider(service: Service) {
    debugger;
    return (service.__.provider as Provider).proxy;
}

// function getProvider(service: Service, provider: any) {
//     const __ = service.__;
//     assert(__.identifier, 'This service has not identifier');
//     provider[__.identifier] = service;
//     __.$children.forEach(s => getProvider(s, provider));
// }

export function lazyInject<T extends Service>(
    key: keyof T,
    identifier: IIentifier,
    serviceClass: IServiceClass,
    ...arg: any[]
): IInjector {
    return function resolve(parent: T) {
        const provider = parent.getProvider();
        provider.register(identifier, serviceClass);
        def(parent, key, {
            get: () => {
                let instance;
                if (!provider.hasInstance(identifier)) {
                    instance = provider.getInstance(identifier);
                    parent.appendChild(instance as Service, key, identifier);
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

    register(identifier: IIentifier, serviceClass?: IServiceClass) {
        if (process.env.NODE_ENV !== 'production') {
            assert(!this.classMap.has(identifier),
                `The IIentifier ${identifier.toString()} has been repeated`);
        }

        serviceClass && this.classMap.set(identifier, serviceClass);
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
                assert(serviceClass, `${identifier} can not find this class`);
            }
            serviceClass && this.instancesMap.set(identifier, new serviceClass());
        }
        return this.instancesMap.get(identifier);
    }

    push(identifier: IIentifier, service: Service) {
        this.register(identifier);
        this.instancesMap.set(identifier, service);
    }

    hasInstance(identifier: IIentifier) {
        return this.instancesMap.has(identifier);
    }
}