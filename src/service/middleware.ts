
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

    public dispatchBefore(...arg: any[]) {
        this.run(this.beforeSubs, ...arg);
    }
    public dispatchAfter(...arg: any[]) {
        this.run(this.afterSubs, ...arg);
    }

    public run(subs: ISubs, ...arg: any[]) {
        subs.forEach(sub => {
            sub.apply(null, arg);
        });
    }
}