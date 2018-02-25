/**
 * vubx interface
 */

/* service */
export { IConstructor, IServiceClass, IIdentifier, IPlugin } from './service/helper';
export { ISub, ISubs, ISubscribeOption } from './service/middleware';
export { IMutation } from './service/mutation';

/* di */
export { IInjector, IDeps, IServiceFactory } from './di/injector';

/* module */
export { IModuleOption, IStateModule } from './module/module';

/**
 * vubx api
 */
export { bind } from './di/binding';
export { concat } from './module/concat';
export {
    createDecorator,
    Mutation,
    LazyInject,
    Created,
    StateModule
} from './decorator';
export { replaceState, subscribe } from './service/helper';
export { commit } from './service/mutation';
