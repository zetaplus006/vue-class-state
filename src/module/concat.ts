import { def } from '../util';

export function concat (...modules: any[]) {
    const proxy = {};
    modules.forEach((module) => defProxy(proxy, module));
    return proxy;
}

function defProxy (proxy: any, target: any) {
    Object.keys(target).forEach((key) => {
        const desc = Object.getOwnPropertyDescriptor(target, key);
        if (desc) {
            def(proxy, key, desc);
        }
    });
}
