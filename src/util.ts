
export function assert(condition: any, msg: string) {
    if (!condition) throw new Error(`[vue-class-state warn] ${msg}`);
}

const _hasOwn = Object.prototype.hasOwnProperty;
export function hasOwn(obj: any, key: string) {
    return _hasOwn.call(obj, key);
}

export const def = Object.defineProperty;

export function hideProperty(obj: any, key: string, value: any) {
    def(obj, key, {
        value,
        enumerable: false,
        configurable: true
    });
}

export function defGet(obj: any, key: string, get: () => any) {
    def(obj, key, {
        get,
        enumerable: true,
        configurable: true
    });
}

export function assign<T, U>(target: T, source: U): T & U {
    let key;
    for (key in source) {
        if (hasOwn(source, key)) {
            (target as any)[key] = source[key];
        }
    }
    return target as any;
}

export const isDev = process.env.NODE_ENV !== 'production';
