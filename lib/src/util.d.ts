export declare function isFn(target: any): boolean;
export declare function isObject(obj: any): boolean;
export declare function isPromise(val: any): boolean;
export declare function assert(condition: any, msg: string): void;
export declare const hasSymbol: boolean;
export declare const def: {
    (o: any, p: string, attributes: PropertyDescriptor & ThisType<any>): any;
    (o: any, propertyKey: PropertyKey, attributes: PropertyDescriptor): any;
};
