
export interface IMap<K, V> {
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V): this;
}

export class SimpleMap<K, V> implements IMap<K, V> {

    private dictionary = {};

    public get(key: K): V | undefined {
        return this.dictionary[key as any] || undefined;
    }

    public set(key: K, value: V): this {
        this.dictionary[key as any] = value;
        return this;
    }

    public has(key: K): boolean {
        return this.dictionary[key as any] === undefined;
    }
}

export const UseMap = typeof Map === 'function' ? Map : SimpleMap as any;