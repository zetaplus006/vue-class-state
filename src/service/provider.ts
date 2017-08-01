import Vue from 'vue';
import { Service, IConstructor, IInjector } from './observable';
import { assert } from '../util';
export function createProvider(service: Service) {
    const provider = {};
    getProvider(service, provider);
    return provider;
}

function getProvider(service: Service, provider: any) {
    const __ = service.__;
    assert(__.identifier, 'This service has not identifier');
    provider[__.identifier] = service;
    __.$children.forEach(s => getProvider(s, provider));
}

export function lazyInject<T extends Service>
    (key: keyof T, identifier: string,
    serviceConstructor: new (...arg: any[]) => Service,
    ...arg: any[])
    : IInjector {
    return function resolve(parent: T) {
        let service: Service;
        Object.defineProperty(parent, key, {
            get: () => {
                if (!service) {
                    service = new serviceConstructor(...arg);
                    parent.appendChild(service, key, identifier);
                }
                return service;
            },
            enumerable: true,
            configurable: true
        });
    };
}