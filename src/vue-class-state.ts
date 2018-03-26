/**
 * vue-class-state interface
 */

/* state */
export { IClass, IIdentifier, IPlugin } from './state/helper';
export { IMutation } from './state/mutation';

/* di */
export { IInjector, IInstanceFactory } from './di/injector';

/* module */
export { IContainerOption, IContainer } from './di/container';

/**
 * vue-class-state api
 */
export { bind } from './di/binding';
export { State } from './state/state';
export { Computed as Getter } from './state/computed';
export { Inject } from './di/inject';
export { Mutation } from './state/mutation';
export { Container } from './di/container';
