import { ScopeData } from './helper';
declare module './service' {
    interface IService {
        __scope__: ScopeData;
    }
    interface Service extends IService {
    }
}