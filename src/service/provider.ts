import Vue from 'vue';
import { Service } from './observable';
export function createProvider(service: Service) {
    const provider = {};
    getProvider(service, provider);
    return provider;
}

function getProvider(service: Service, provider: any) {
    if (!service.$identifier) {
        return;
    }
    provider[service.$identifier] = service;
    if (service.$children.length > 0) {
        service.$children.forEach(s => getProvider(s, provider));
    }
}