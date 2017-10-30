import { IInjector, IDeps } from './injector';
import { assert, def } from '../util';
import { IIdentifier } from '../service/helper';
import { IService } from '../service/service';
import { DIMetaData } from './di_meta';

export type IProxyState = {
    [key: string]: IService
};

export class Provider {
    private injectorMap: Map<IIdentifier, IInjector<IService>> = new Map();

    /**
     * for vue provide option
     */
    public proxy: any = {};

    public hooks: ((instance: any, meta: DIMetaData) => void)[] = [];


    /**
     * get service instance
     * @param identifier
     */
    public get(identifier: IIdentifier): any {
        const injector = this.injectorMap.get(identifier);
        if (process.env.NODE_ENV !== 'production') {
            assert(injector,
                `${identifier.toString()} not find in provider`);
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
                `The identifier ${identifier.toString()} has been repeated`);
        }
    }

    /**
     * replaceState for SSR and devtool
     * @param proxyState
     */
    public replaceAllState(proxyState: IProxyState) {
        for (const key in proxyState) {
            (this.proxy[key] as IService).replaceState(proxyState[key], false);
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