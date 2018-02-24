import { ScopeData } from './helper';
declare module './service' {
    interface IService {
        __scope__: ScopeData;
    }
    // tslint:disable
    interface Service extends IService {
    }
}
