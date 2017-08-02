import { createDecorator, IVubxDecorator } from 'vubx';
import Vue from 'vue';

export const store: IVubxDecorator = createDecorator(Vue);