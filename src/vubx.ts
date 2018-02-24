/**
 * vubx interface
 */

/* service */
export { IConstructor, IServiceClass, IIdentifier, IPlugin } from './service/helper';
export { ISub, ISubs, ISubscribeOption } from './service/middleware';
export { IMutation } from './service/mutation';
export { IService } from './service/service';
export { IDecoratorOption, IVubxDecorator } from './service/observable';

/* di */
export { IInjector, IDeps, IServiceFactory } from './di/injector';

/* module */
export { IModuleOption, IStateModule } from './module/module';

/**
 * vubx api
 */
export { Service } from './service/service';
export { bind } from './di/binding';
export { concat } from './module/concat';
export {
    createDecorator,
    mutation, mutation as Mutation,
    lazyInject, lazyInject as LazyInject,
    created, created as Created,
    StateModule
} from './decorator';
