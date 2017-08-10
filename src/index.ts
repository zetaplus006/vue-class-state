import Vue from 'vue';
import devtool from './plugins/devtool';
import { Service } from './service/observable';
import { lazyInject, bindClass, bindFactory } from './service/provider';

export * from './interfaces';

export {
    createDecorator,
    mutation,
    action
} from './decorator';

export {
    Service,
    devtool,
    lazyInject,
    bindClass,
    bindFactory
};
