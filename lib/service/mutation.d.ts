import { IIdentifier } from './helper';
export interface IMutation {
    type: string;
    payload: any[];
    methodName: string;
    identifier: IIdentifier;
}
export declare function mutation(target: any, mutationyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;
