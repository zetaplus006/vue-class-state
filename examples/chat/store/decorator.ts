import { createDecorator } from 'vubx';
import Vue from 'vue';
import { IVubxDecorator } from '../../../src/service/observable';

export const store: IVubxDecorator = createDecorator(Vue);