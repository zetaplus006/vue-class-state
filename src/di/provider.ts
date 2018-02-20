import { IInjector, IDeps } from './injector';
import { assert, def } from '../util';
import { IIdentifier } from '../service/helper';
import { IService, Service } from '../service/service';
import { DIMetaData } from './di_meta';
import { IMap, UseMap } from '../di/map';

export type IProxyState = {
    [key: string]: any
};

export class Provider {
    private injectorMap: IMap<IIdentifier, IInjector<any>> = new UseMap();

    /**
     * for vue provide option
     */
    public proxy: any = {};

    public hooks: ((instance: any, meta: DIMetaData) => void)[] = [];

    constructor(proxyObj: any) {
        this.proxy = proxyObj;
    }

    /**
     * get service instance
     * @param identifier
     */
    public get(identifier: IIdentifier): any {
        const injector = this.injectorMap.get(identifier);
        if (process.env.NODE_ENV !== 'production') {
            assert(injector,
                `${String(identifier)} not find in provider`);
        }
        return (injector as IInjector<any>).resolve();
    }

    /**
     * get service instance array
     * @param deps
     */
    public getAll(deps: IDeps): any[] {
        return deps.map(identifier => this.get(identifier));
    }

    /**
     * register a injector in the provider
     * @param injector
     */
    public register(injector: IInjector<any>) {
        this.checkIdentifier(injector.identifier);
        injector.provider = this;
        this.injectorMap.set(injector.identifier, injector);
        this.defProxy(injector);
    }

    public checkIdentifier(identifier: IIdentifier) {
        if (process.env.NODE_ENV !== 'production') {
            assert(!this.injectorMap.has(identifier),
                `The identifier ${String(identifier)} has been repeated`);
        }
    }

    /**
     * replaceState for SSR and devtool
     * @param proxyState
     */
    public replaceAllState(proxyState: IProxyState) {
        for (const key in proxyState) {
            const instance = this.proxy[key];
            if (instance instanceof Service) {
                instance.replaceState(proxyState[key], false);
            }
        }
    }

    public registerInjectedHook(injected: (instance: any, meta: DIMetaData) => void) {
        if (this.hooks.indexOf(injected) > -1) {
            return;
        }
        this.hooks.push(injected);
    }

    /**
     * for vue provide option
     * @param injector
     */
    private defProxy(injector: IInjector<any>) {
        /* if (!injector.isSingleton) {
            return;
        } */
        const desc: PropertyDescriptor = {
            get: () => {
                return injector.resolve();
            },
            enumerable: true,
            configurable: true
        };
        def(this.proxy, injector.identifier, desc);
        // for devtool
        if (typeof injector.identifier === 'symbol') {
            def(this.proxy, String(injector.identifier), desc);
        }
    }

}