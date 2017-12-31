import { IService } from './service';
import { IIdentifier } from './helper';
export interface IMutation {
    type: string;
    payload: any[];
    mutationType: string;
    identifier: IIdentifier;
}
export declare function mutation(target: any, methodName: string, descriptor: PropertyDescriptor): PropertyDescriptor;
export declare function runInMutaion(ctx: IService, func: Function, payload: any, mutationType?: string): any;
