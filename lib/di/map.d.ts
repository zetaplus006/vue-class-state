export interface IMap<K, V> {
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V): this;
}
export declare class SimpleMap<K, V> implements IMap<K, V> {
    private dictionary;
    get(key: K): V | undefined;
    set(key: K, value: V): this;
    has(key: K): boolean;
}
export declare const UseMap: any;
