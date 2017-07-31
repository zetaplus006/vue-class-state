import Vue from 'vue';
import { Service } from './observable';
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