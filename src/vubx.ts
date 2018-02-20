
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

export { IModuleOption } from './module/module';

/**
 * vubx api
 */
export { Service } from './service/service';
export { bind } from './di/binding';
export { createDecorator, mutation, lazyInject, created } from './decorator';
export { StateModule } from './module/module';
