import { ClassMetaData } from '../di/class_meta';
import { IDeps } from '../di/injector';

export interface ICreatedHook {
    method: (...arg: any[]) => void;
    methodName: string;
    deps: IDeps;
}

export function Created(deps: IDeps = []) {
    return function (target: any, methodName: string, desc: PropertyDescriptor) {
        const meta = ClassMetaData.get(target);
        meta.hookMeta = {
            method: desc.value,
            methodName,
            deps
        };
    };
}
