import { store } from './decorator';
import { MessageStore, IMessage, IMessages } from './messages';
import { ThreadsStore, IThreadsData } from './threads';
import { createProvider, Service, devtool } from 'vubx';
import { getAllMessages } from '../api/index';

export const identifier = {
    CHAT: 'chatStore',
    MESSAGE: 'messageStore',
    THREADS: 'threadsStore'
};

@store({
    strict: true,
    identifier: identifier.CHAT
})
export class ChatStore extends Service {

    messageStore: MessageStore;
    threadsStore: ThreadsStore;

    constructor() {
        super();
        this.appendChild<MessageStore>(new MessageStore(), 'messageStore', identifier.MESSAGE);
        this.appendChild<ThreadsStore>(new ThreadsStore(), 'threadsStore', identifier.THREADS);
    }

    get threads(): IThreadsData {
        return this.threadsStore.threadsData;
    }

    get messages(): IMessages {
        return this.messageStore.messages;
    }

    init() {
        getAllMessages((messages: IMessage[]) => {
            let lastMsg: IMessage = messages[0];
            messages.forEach(msg => {
                if (!this.threads[msg.threadID]) {
                    this.threadsStore.createThreads(msg.threadID, msg.authorName);
                }
                if (!lastMsg || msg.timestamp > lastMsg.timestamp) {
                    lastMsg = msg;
                }
                this.messageStore.addMessages(msg);
            });
            if (lastMsg) {
                this.threadsStore.setCurrentThread(lastMsg.threadID);
            }
        });
    }
}

const chatStore = new ChatStore();

devtool(chatStore);
chatStore.init();

export default createProvider(chatStore);
