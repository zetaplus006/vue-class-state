import { Service } from './service/observable';
import { Middleware } from './service/middleware';
import { Provider } from './service/provider';

export type IConstructor = { new(...args: any[]): {} };
export type IServiceClass = { new(...args: any[]): Service };

export interface IDecoratorOption {
    strict?: boolean;
    identifier?: IIentifier;
    root?: boolean;
    injector?: IInjector[];
}
export type IVubxDecorator = (option?: IDecoratorOption) => (constructor: IConstructor) => any;

export interface IVubxHelper {
    $getters: any;
    $state: any;
    $root: Service | null;
    $parent: Service[];
    $children: Service[];
    isCommitting: boolean;
    middleware: Middleware;
    provider: Provider | null;
}

export type IIentifier = string | symbol;

export type IInjector = (s: Service) => void;

// middleware

export type ISub = (...arg: any[]) => any;

export type ISubs = Array<ISub>;

export type ISubscribeOption = {
    before?: ISub
    after?: ISub
};

export interface IMutation {
    type: string;
    payload: any;
}