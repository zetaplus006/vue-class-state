
export function assert(condition: any, msg: string) {
    if (!condition) throw new Error(`[vue-class-state warn] ${msg}`);
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
