import Vue from 'vue';

declare module 'vue/types/options' {
    // tslint:disable-next-line:interface-name
    interface WatchOptions {
        sync?: boolean;
    }
}

declare module 'vue/types/vue' {
    // tslint:disable-next-line:interface-name
    interface VueConstructor<V extends Vue = Vue> {
        util: {
            defineReactive(
                obj: any,
                key: string,
                val: any,
                customSetter?: (value: any) => void
            ): void
        };
    }
}
