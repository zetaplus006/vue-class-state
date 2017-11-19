import { Service } from 'vubx';
import { IThreadsData, IThreads, IMessages, IMessage } from './type';
export declare const serviceKey: {
    CHAT: string;
};
export declare class ChatStore extends Service {
    currentThreadID: string;
    threads: IThreadsData;
    messages: IMessages;
    readonly CurrentThieads: IThreads;
    createThreads(id: string, name: string): void;
    setCurrentThread(threadId: string): void;
    addMessage(message: IMessage): void;
    init(): void;
}
declare const _default: any;
export default _default;
