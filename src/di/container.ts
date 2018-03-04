import { devtool } from '../dev/devtool';
import { Binding } from '../di/binding';
import { DIMetaData } from '../di/di_meta';
import { Provider } from '../di/provider';
import { IConstructor, IIdentifier, IPlugin, useStrict } from '../state/helper';
import { Middleware } from '../state/middleware';
import { scopeKey } from '../state/scope';
import { hideProperty } from '../util';

export interface IContainerOption {
    providers: Array<Binding<any>>;
    globalPlugins?: IPlugin[];
    strict?: IIdentifier[];
    devtool?: IIdentifier[];
}

export interface IContainer {
    _provider: Provider;
    _globalPlugins: IPlugin[];
    _option: IContainerOption;
}

export function Container(option: IContainerOption) {
    return function (_target: IConstructor) {
        return createContainerClass(option);
    };
}

function createContainerClass(option: IContainerOption) {
    return class $StateModule implements IContainer {

        public _provider: Provider;

        public _globalPlugins: IPlugin[];

        public _option: IContainerOption;

        constructor() {
            hideProperty(this, '_provider', new Provider(this));
            hideProperty(this, '_globalMiddleware', new Middleware());
            hideProperty(this, '_globalPlugins', option.globalPlugins || []);
            hideProperty(this, '_option', option);
            this._provider.registerInjectedHook((instance: any, diMetaData: DIMetaData) => {
                const scope = instance[scopeKey];
                if (scope) {
                    if (!diMetaData.hasBeenInjected
                        && this._option.strict
                        && this._option.strict.indexOf(diMetaData.identifier) > -1) {
                        useStrict(instance);
                    }
                    this._globalPlugins.forEach((action) => action(instance));
                }
            });
            option.providers.forEach((binding) => this._provider.register(binding.injectorFactory()));

            if (option.devtool && option.devtool.length > 0) {
                devtool(this, option.devtool || []);
            }
        }
    };
}
