import Vue from 'vue';

const injectPrefix = '@Inject: ';

export function showInject(isShow: boolean = true) {
    if (process.env.NODE_ENV !== 'production' && isShow && !Vue.prototype.$isServer) {
        Vue.mixin({
            beforeCreate() {
                const inject = this.$options.inject || {};
                Object.keys(inject).forEach(key => {
                    if (this.$options.computed === undefined) {
                        this.$options.computed = Object.create(null);
                    }
                    this.$options.computed![injectPrefix + key] = () => this[key];
                });
            }
        });
    }
}
