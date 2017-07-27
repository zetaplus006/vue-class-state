import { PluginFunction } from 'vue';
import Vue from 'vue';
import { Service } from "./service";


export interface IVuesOption {
    targetClass: Function
}

const plugin = {
    install: function(_Vue: typeof Vue, vuesOption: IVuesOption) {

    }
}



export default {
    install: plugin.install,
}

export * from './decorator';
export {
    Service
}
