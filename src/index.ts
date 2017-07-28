import { PluginFunction } from 'vue';
import Vue from 'vue';
import { Service } from "./service";
import devtool from './plugins/devtool';


export interface IvubxOption {
    targetClass: Function
}

const plugin = {
    install: function(_Vue: typeof Vue, vubxOption: IvubxOption) {

    }
}



export default {
    install: plugin.install,
}

export * from './decorator';
export {
    devtool,
    Service

}
