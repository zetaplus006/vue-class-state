import Vue from 'vue';
import devtool from './plugins/devtool';
import { Service } from './service/observable';
import { createProvider } from './service/provider';

export * from './interfaces';
export * from './decorator';
export {
    devtool,
    Service,
    createProvider
};
