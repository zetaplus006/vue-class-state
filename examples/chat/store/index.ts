import { store } from './decorator';
import { createProvider, Service, devtool, mutation } from 'vubx';
import { getAllMessages } from '../api/index';
import { IThreadsData, IThreads, IMessages, IMessage } from './type';

export const identifier = {
    CHAT: 'chatStore'
};

@store({
    strict: true,
    root: true,
    identifier: identifier.CHAT
})
export class ChatStore extends Service {
    currentThreadID: string = '';
    threads: IThreadsData = {};
    messages: IMessages = {};

    get CurrentThieads(): IThreads {
        return this.threads[this.currentThreadID] || null;
    }

    @mutation
    createThreads(id: string, name: string) {
        this.$set(this.threads, id, {
            id,
            name,
            messages: [],
            lastMessage: null
        });
    }

    @mutation
    setCurrentThread(threadId: string) {
        this.currentThreadID = threadId;
        this.threads[threadId].lastMessage.isRead = true;
    }

    @mutation
    addMessage(message: IMessage) {
        message.isRead = message.threadID === this.currentThreadID;

        const thread = this.threads[message.threadID];
        if (!thread.messages.some(id => id === message.id)) {
            thread.messages.push(message.id);
            thread.lastMessage = message;
        }
        this.$set(this.messages, message.id, message);
    }

    init() {
        getAllMessages((messages: IMessage[]) => {
            let lastMsg: IMessage = messages[0];
            messages.forEach(msg => {
                if (!this.threads[msg.threadID]) {
                    this.createThreads(msg.threadID, msg.authorName);
                }
                if (!lastMsg || msg.timestamp > lastMsg.timestamp) {
                    lastMsg = msg;
                }
                this.addMessage(msg);
            });
            if (lastMsg) {
                this.setCurrentThread(lastMsg.threadID);
            }
        });
    }
}

const chatStore = new ChatStore();

devtool(chatStore);

export default createProvider(chatStore);