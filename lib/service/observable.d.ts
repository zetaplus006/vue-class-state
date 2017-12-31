import { VueConstructor } from 'vue';
import { IConstructor, IPlugin, IIdentifier } from './helper';
import { IService } from './service';
import { DIMetaData } from '../di/di_meta';
import { ICreatedHook } from './hook';
import { Binding } from '../di/binding';
export declare type IDecoratorOption = {
    identifier?: IIdentifier;
    root?: boolean;
    strict?: boolean;
    devtool?: boolean;
    providers?: Binding<any>[];
    plugins?: IPlugin[];
    globalPlugins?: IPlugin[];
};
export declare type IVubxOption = {
    identifier: IIdentifier;
    root: boolean;
    strict?: boolean;
    devtool: boolean;
    providers: Binding<any>[];
    plugins: IPlugin[];
    globalPlugins: IPlugin[];
    createdHook: ICreatedHook;
};
export declare type IVubxDecorator = (option?: IDecoratorOption) => (constructor: IConstructor) => any;
export declare function createDecorator(vueConstructor: VueConstructor): IVubxDecorator;
export declare function createVubxClass(vueConstructor: VueConstructor, constructor: IConstructor, decoratorOption?: IDecoratorOption): {
    new (...arg: any[]): {};
};
export declare function createdHook(service: IService, option: IVubxOption, diMeta: DIMetaData): void;
