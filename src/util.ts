export function isFn(target: any) {
    return typeof target === 'function';
}

export function isObject(obj: any) {
    return obj !== null && typeof obj === 'object';
}

export function isPromise(val: any) {
    return val && typeof val.then === 'function';
}

export function assert(condition: any, msg: string) {
    if (!condition) throw new Error(`[vubx] ${msg}`);
}

export function warn(msg: string) {
    console.warn(`[vubx] warn: The parent service already has this child service and cannot be added repeatedly`);
}

export const hasSymbol = typeof Symbol === 'function';