import { IDeps } from '../di/injector';
export declare type ICreatedHook = {
    method: Function;
    methodName: string;
    deps: IDeps;
};
export declare function created(deps?: IDeps): (target: any, methodName: string, desc: PropertyDescriptor) => void;
