import { IIdentifier, IPlugin, useStrict } from '../service/helper';
import { Middleware } from '../service/middleware';
import { Provider } from '../di/provider';
import { hideVal } from '../util';
import { IService } from '../service/service';
import { DIMetaData } from '../di/di_meta';
import { Service } from '../service/service';
import { createdHook } from '../service/observable';
import { devtool } from '../plugins/devtool';

export type IModuleOption = {
    providers: any[],
    globalPlugins?: IPlugin[],
    strict?: IIdentifier[],
    devtool?: IIdentifier[]
};

export class StateModule {

    private _provider: Provider;

    private _globalMiddleware: Middleware;

    private _globalPlugins: IPlugin[];

    private _option: IModuleOption;

    constructor(option: IModuleOption) {
        hideVal(this, '_provider', new Provider(this));
        hideVal(this, '_globalMiddleware', new Middleware());
        hideVal(this, '_globalPlugins', []);
        hideVal(this, '_option', option);
        this._provider.registerInjectedHook((instance: IService, diMetaData: DIMetaData) => {
            if (instance instanceof Service) {
                // instance.__scope__.$root = this as any;

                instance.__scope__.module = this;

                if (!diMetaData.hasBeenInjected
                    && this._option.strict
                    && this._option.strict.indexOf(diMetaData.identifier) > -1) {
                    useStrict(instance);
                }

                createdHook(instance, instance.__scope__.vubxOption, diMetaData);
            }
        });
        option.providers.forEach(binding => this._provider.register(binding.injectorFactory()));

        if (option.devtool && option.devtool.length > 0) {
            devtool(this, option.devtool || []);
        }

    }
}
