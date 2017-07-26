import Vue from 'vue';
import { observe } from './observable';

// from install

/**
 * property decorator for dependencies inject
 * @param serviceIdentifier 
 */
export function service(serviceIdentifier: string | symbol) {
    return function (target: Function, key: string, des: PropertyDescriptor) {

    }
}

/**
 * class decorator
 * @param target 
 */
export function obsverable(target: any) {
    return observe(target);
}

export function init(_Vue: typeof Vue) {

}

if (typeof window !== 'undefined' && window['Vue']) {
    init(window['Vue'])
}


@obsverable
class Test {
    data: string[] = ['', 'ss'];
    obj = { a: 11 }
}

console.log(new Test());