import { IService } from '../src/service/service';

declare module 'vue/types/options' {
    interface WatchOptions {
        sync?: boolean;
    }
}