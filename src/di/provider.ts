import { IMap, UseMap } from '../di/map';
import { IIdentifier, replaceState } from '../state/helper';
import { assert, defGet } from '../util';
import { DIMetaData } from './di_meta';
import { IInjector } from './injector';

export interface IProxyState {
    [key: string]: any;
}

export class Provider {

    /**
     * for vue provide option
     */
    public proxy: any;

    public hooks: Array<(instance: any, meta: DIMetaData) => void> = [];

    constructor(proxyObj: any) {
        this.proxy = proxyObj;
    }

    private injectorMap: IMap<IIdentifier, IInjector<any>> = new UseMap();

    /**
     * get state instance
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
     * get state instance array
     * @param deps
     */
    public getAll(deps: IIdentifier[]): any[] {
        return deps.map((identifier) => this.get(identifier));
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
            replaceState(instance, proxyState[key]);
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
        defGet(this.proxy, injector.identifier, () => {
            return injector.resolve();
        });
    }

}
