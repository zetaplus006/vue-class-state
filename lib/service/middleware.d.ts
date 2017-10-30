export declare type ISub = (...arg: any[]) => any;
export declare type ISubs = ISub[];
export declare type ISubscribeOption = {
    before?: ISub;
    after?: ISub;
};
export declare class Middleware {
    private beforeSubs;
    private afterSubs;
    subscribe(option: ISubscribeOption): void;
    /**
     * get a aop function
     * @param fn
     * @param ctx
     */
    createTask(fn: ISub, ctx?: any | null): Function;
    dispatchBefore(ctx: any | null, ...arg: any[]): void;
    dispatchAfter(ctx: any | null, ...arg: any[]): void;
    private run(subs, ctx, ...arg);
}
