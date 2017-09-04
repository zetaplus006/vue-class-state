import { IService, IIdentifier } from '../interfaces';
import { IInjector } from './injector';
import { Service } from '../service/observable';
import { assert, def } from '../util';

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

    public register(injector: IInjector<IService>) {
        this.checkIdentifier(injector.identifier);
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