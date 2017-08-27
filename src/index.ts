import Vue from 'vue';

export * from './interfaces';
export { Service } from './service/observable';
export { bindClass, bindFactory } from './service/provider';
export { createDecorator, mutation, lazyInject } from './decorator';
