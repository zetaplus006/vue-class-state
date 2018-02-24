import { Binding } from '../di/binding';
import { DIMetaData } from '../di/di_meta';
import { Provider } from '../di/provider';
import { devtool } from '../plugins/devtool';
import { IIdentifier, IPlugin, useStrict } from '../service/helper';
import { Middleware } from '../service/middleware';
import { createdHook } from '../service/observable';
import { IService } from '../service/service';
import { Service } from '../service/service';
import { hideProperty } from '../util';

export interface IModuleOption {
    providers: Array<Binding<any>>;
    globalPlugins?: IPlugin[];
    strict?: IIdentifier[];
    devtool?: IIdentifier[];
}

export interface IStateModule {
    _provider: Provider;
    _globalMiddleware: Middleware;
    _globalPlugins: IPlugin[];
    _option: IModuleOption;
}

export function StateModule (option: IModuleOption) {
    return function (_target: any) {
        return createModuleClass(option);
    };
}

function createModuleClass (option: IModuleOption) {
    return class $StateModule implements IStateModule {

        public _provider: Provider;

        public _globalMiddleware: Middleware;

        public _globalPlugins: IPlugin[];

        public _option: IModuleOption;

        constructor () {
            hideProperty(this, '_provider', new Provider(this));
            hideProperty(this, '_globalMiddleware', new Middleware());
            hideProperty(this, '_globalPlugins', []);
            hideProperty(this, '_option', option);
            this._provider.registerInjectedHook((instance: IService, diMetaData: DIMetaData) => {
                if (instance instanceof Service) {

                    instance.__scope__.module = this;

                    if (!diMetaData.hasBeenInjected
                        && this._option.strict
                        && this._option.strict.indexOf(diMetaData.identifier) > -1) {
                        useStrict(instance);
                    }

                    createdHook(instance, instance.__scope__.vubxOption, diMetaData);
                }
            });
            option.providers.forEach((binding) => this._provider.register(binding.injectorFactory()));

            if (option.devtool && option.devtool.length > 0) {
                devtool(this, option.devtool || []);
            }
        }
    };
}
