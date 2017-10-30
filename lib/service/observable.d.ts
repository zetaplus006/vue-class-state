import Vue from 'vue';
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
    strict: boolean;
    devtool: boolean;
    providers: Binding<any>[];
    plugins: IPlugin[];
    globalPlugins: IPlugin[];
    createdHook: ICreatedHook;
};
export declare type IVubxDecorator = (option?: IDecoratorOption) => (constructor: IConstructor) => any;
/**
 * createObserveDecorator
 * @param _Vue
 */
export declare function createDecorator(_Vue: typeof Vue): IVubxDecorator;
export declare function createdHook(service: IService, option: IVubxOption, diMeta: DIMetaData): void;
