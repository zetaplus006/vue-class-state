import { store } from './decorator';
import { Service, mutation } from 'vubx';
import { IMessage } from './messages';

export interface IThreads {
    id: string;
    name: string;
    messages: string[];
    lastMessage: IMessage;
}

export interface IThreadsData { [id: string]: IThreads; }

@store()
export class ThreadsStore extends Service {
    threadsData: IThreadsData = {};

    currentThreadID: string = '';

    @mutation
    createThreads(id: string, name: string) {
        this.$set(this.threadsData, id, {
            id,
            name,
            messages: [],
            lastMessage: null
        });
    }
    @mutation
    setCurrentThread(threadId: string) {
        this.currentThreadID = threadId;
        this.threadsData[threadId].lastMessage.isRead = true;
    }
}