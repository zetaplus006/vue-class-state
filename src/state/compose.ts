import { IMutation } from './mutation';
export type IMiddleware<T = any> = (next: () => void, mutation: IMutation, state: T) => void;

/**
 * change from https://github.com/koajs/compose/blob/master/index.js
 */
export function compose(middlewares: IMiddleware[]): IMiddleware {
    return function (next: () => void, mutation: IMutation, state: any) {
        let index: number = -1;
        return dispatch(0);
        function dispatch(i: number): void {
            if (i <= index) throw new Error('next() called multiple times');
            index = i;
            let fn = middlewares[i];
            if (i === middlewares.length) fn = next;
            if (!fn) return;
            try {
                // tslint:disable-next-line:no-shadowed-variable
                return fn(function next() {
                    return dispatch(i + 1);
                }, mutation, state);
            } catch (err) {
                throw err;
            }
        }
    };
}
