import { ISub, ISubscribeOption } from '../interfaces';
export declare class Middleware {
    private beforeSubs;
    private afterSubs;
    subscribe(option: ISubscribeOption): void;
    createTask(fn: ISub, ctx?: any | null): Function;
    dispatchBefore(ctx: any | null, ...arg: any[]): void;
    dispatchAfter(ctx: any | null, ...arg: any[]): void;
    private run(subs, ctx, ...arg);
}
