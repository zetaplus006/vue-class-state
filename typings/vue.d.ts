import { IService } from '../src/interfaces';

declare module 'vue/types/options' {
    interface WatchOptions {
        sync?: boolean;
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $service: IService;
    }
}