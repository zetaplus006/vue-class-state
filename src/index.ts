import Vue from 'vue';

export * from './interfaces';
export { Service } from './service/observable';
export { bind } from './di/binding'
export { createDecorator, mutation, lazyInject } from './decorator';
