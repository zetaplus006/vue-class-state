import Vue from 'vue';

declare module "vue/types/options" {
    interface WatchOptions {
        sync?: boolean
    }
}