import Vue from 'vue';
import devtool from './plugins/devtool';
import { Service } from './service/observable';
import { createProvider, lazyInject, bindClass, bindFactory } from './service/provider';

export * from './interfaces';

export {
    createDecorator,
    mutation,
    action
} from './decorator';

export {
    createProvider,
    Service,
    devtool,
    lazyInject,
    bindClass,
    bindFactory
};
