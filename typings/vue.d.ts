import Vue from "vue";

declare module 'vue/types/options' {
    // tslint:disable-next-line:interface-name
    interface WatchOptions {
        sync?: boolean;
    }
}

declare module 'vue/types/vue' {

    interface VueConstructor<V extends Vue = Vue> {
        util: {
            defineReactive(
                obj: Object,
                key: string,
                val: any,
                customSetter?: Function
            ): void
        }
    }
}

