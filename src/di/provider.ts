import { IInjector, IDeps } from './injector';
import { assert, def } from '../util';
import { IIdentifier } from '../service/helper';
import { IService } from '../service/service';

export class Provider {
    private injectorMap: Map<IIdentifier, IInjector<IService>> = new Map();
    public proxy: {} = {};

    public get(identifier: IIdentifier): IService {
        const injector = this.injectorMap.get(identifier);
        if (process.env.NODE_ENV !== 'production') {
            assert(injector,
                `${identifier.toString()} not find in provider`);
        }
        return (injector as IInjector<IService>).resolve();
    }

    public getAll(deps: IDeps): IService[] {
        return deps.map(identifier => this.get(identifier));
    }

    public register(injector: IInjector<IService>) {
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