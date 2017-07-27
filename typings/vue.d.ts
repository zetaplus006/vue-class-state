import Vue from 'vue';
declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        service?: any;
    }
}

declare module "vue/types/vue" {
    interface Vue {
        $service: any;
    }
}

declare module "vue/types/options" {
    interface WatchOptions {
        sync?: boolean
    }
}