import { isFn } from '../util';

export type ISub = (...arg: any[]) => any;

export type ISubs = Array<ISub>;

export type ISubscribeOption = {
    before?: ISub
    after?: ISub
};

export class Middleware {
    private beforeSubs: ISubs = [];
    private afterSubs: ISubs = [];

    public subscribe(option: ISubscribeOption) {
        if (!option) return;
        if (option.before) {
            this.beforeSubs.push(option.before);
        }
        if (option.after) {
            this.afterSubs.push(option.after);
        }
    }

    public createTask(fn: ISub, ctx: any | null = null): Function {
        // fn maybe array
        const self = this;
        return function(...arg: any[]) {
            self.dispatchBefore(ctx, ...arg);
            const res = fn.apply(ctx, arg);
            self.dispatchAfter(ctx, ...arg);
            return res;
        };
    }

    public dispatchBefore(ctx: any | null, ...arg: any[]) {
        this.run(this.beforeSubs, ctx, ...arg);
    }
    public dispatchAfter(ctx: any | null, ...arg: any[]) {
        this.run(this.afterSubs, ctx, ...arg);
    }

    private run(subs: ISubs, ctx: any | null, ...arg: any[]) {
        for (const sub of subs) {
            if (sub.apply(ctx, arg) === false) {
                break;
            }
        }
    }
}
