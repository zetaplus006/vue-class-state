export function isFn(target: any) {
    return typeof target === 'function';
}

export function isPromise(obj: any) {
    return obj && (obj instanceof Promise);
}