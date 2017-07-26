import { PluginFunction } from 'vue';
import Vue from 'vue';
import { init, obsverable } from './service/index';
// interface 不会把vue打包进build


export interface IVuesOption {
    targetClass: Function
}

const plugin = {
    install: function (_Vue: typeof Vue, vuesOption: IVuesOption) {
        init(_Vue);
    }
}


export {
    obsverable
}

export default {
    install: plugin.install
}


