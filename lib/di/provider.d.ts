import { IInjector, IDeps } from './injector';
import { IIdentifier } from '../service/helper';
import { DIMetaData } from './di_meta';
export declare type IProxyState = {
    [key: string]: any;
};
export declare class Provider {
    private injectorMap;
    /**
     * for vue provide option
     */
    proxy: any;
    hooks: ((instance: any, meta: DIMetaData) => void)[];
    /**
     * get service instance
     * @param identifier
     */
    get(identifier: IIdentifier): any;
    /**
     * get service instance array
     * @param deps
     */
    getAll(deps: IDeps): any[];
    /**
     * register a injector in the provider
     * @param injector
     */
    register(injector: IInjector<any>): void;
    checkIdentifier(identifier: IIdentifier): void;
    /**
     * replaceState for SSR and devtool
     * @param proxyState
     */
    replaceAllState(proxyState: IProxyState): void;
    registerInjectedHook(injected: (instance: any, meta: DIMetaData) => void): void;
    /**
     * for vue provide option
     * @param injector
     */
    private defProxy(injector);
}
