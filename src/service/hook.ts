import { IDeps } from '../di/injector';
import { ClassMetaData } from '../di/class_meta';

export type ICreatedHook = {
    method: Function;
    methodName: string;
    deps: IDeps;
};

export function created(deps: IDeps = []) {
    return function (target: any, methodName: string, desc: PropertyDescriptor) {
        const meta = ClassMetaData.get(target);
        meta.hookMeta = {
            method: desc.value,
            methodName,
            deps
        };
    };
}