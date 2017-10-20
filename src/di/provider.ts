import { IInjector, IDeps } from './injector';
import { assert, def } from '../util';
import { IIdentifier } from '../service/helper';
import { IService } from '../service/service';

export type IProxyState = {
    [key: string]: IService
};

export class Provider {
    private injectorMap: Map<IIdentifier, IInjector<IService>> = new Map();

    /**
     * for vue provide option
     */
    public proxy: any = {};

    /**
     *
     * @param rootService all service in provider is dependent this root service
     */
    constructor(
        public rootService: IService
    ) { }

    /**
     * get service instance
     * @param identifier
     */
    public get(identifier: IIdentifier): IService {
        const injector = this.injectorMap.get(identifier);
        if (process.env.NODE_ENV !== 'production') {
            assert(injector,
                `${identifier.toString()} not find in provider`);
        }
        return (injector as IInjector<IService>).resolve();
    }

    /**
     * get service instance array
     * @param deps
     */
    public getAll(deps: IDeps): IService[] {
        return deps.map(identifier => this.get(identifier));
    }

    /**
     * register a injector in the provider
     * @param injector
     */
    public register(injector: IInjector<IService>) {
        this.checkIdentifier(injector.identifier);
        injector.provider = this;
        injector.dependentRoot = this.rootService;
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
     * replaceState for SSR
     * @param proxyState
     */
    public replaceAllState(proxyState: IProxyState) {
        for (const key in proxyState) {
            (this.proxy[key] as IService).replaceState(proxyState[key], false);
        }
    }

    /**
     * for vue provide option
     * @param injector
     */
    private defProxy(injector: IInjector<IService>) {
        def(this.proxy, injector.identifier, {
            get: () => {
                // const instance = injector.resolve();
                // delete this[injector.identifier];
                // this[injector.identifier] = instance;

                // if isSingleton===fales
                return injector.resolve();
            },
            enumerable: true,
            configurable: true
        });
    }

}