import { PluginFunction } from 'vue';
import Vue from 'vue';
import { Service, createProvider } from "./service";
import devtool from './plugins/devtool';

export * from './decorator';
export {
    devtool,
    Service,
    createProvider

};
