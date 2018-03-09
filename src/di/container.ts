import { devtool } from '../dev/devtool';
import { Binding } from '../di/binding';
import { DIMetaData } from '../di/di_meta';
import { Provider } from '../di/provider';
import { IClass, IIdentifier, IPlugin, useStrict } from '../state/helper';
import { scopeKey } from '../state/scope';
import { hideProperty } from '../util';

export interface IContainerOption {
    providers: Array<Binding<any>>;
    globalPlugins?: IPlugin[];
    strict?: boolean | IIdentifier[];
    devtool?: boolean | IIdentifier[];
}

export interface IContainer {
    _provider: Provider;
    _globalPlugins: IPlugin[];
    _option: IContainerOption;
}

export function Container(option: IContainerOption) {
    return function (_target: IClass) {
        return createContainerClass(option);
    };
}

function createContainerClass(option: IContainerOption) {
    return class $StateModule implements IContainer {

        public _provider!: Provider;

        public _globalPlugins!: IPlugin[];

        public _option!: IContainerOption;

        constructor() {
            hideProperty(this, '_provider', new Provider(this));
            hideProperty(this, '_globalPlugins', option.globalPlugins || []);
            hideProperty(this, '_option', option);
            const storeIdentifiers = option.providers.map((binding) => {
                this._provider.register(binding.injectorFactory());
                return binding.identifier;
            });
            const strictList = option.strict === true ? storeIdentifiers : (option.strict || []);
            const devtoolList = option.devtool === false
                ? [] : Array.isArray(option.devtool)
                    ? option.devtool : storeIdentifiers;

            this._provider.registerInjectedHook((instance: any, diMetaData: DIMetaData) => {
                if (process.env.NODE_ENV !== 'production') {
                    if (instance[scopeKey] && !diMetaData.hasBeenInjected
                        && strictList.indexOf(diMetaData.identifier) > -1) {
                        useStrict(instance);
                    }
                }
                this._globalPlugins.forEach((action) => action(instance));
            });
            if (process.env.NODE_ENV !== 'production') {
                devtool(this, devtoolList);
            }
        }
    };
}
