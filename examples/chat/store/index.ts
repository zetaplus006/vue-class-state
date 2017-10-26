import { store } from './decorator';
import { Service, mutation } from 'vubx';
import { getAllMessages } from '../api/index';
import { IThreadsData, IThreads, IMessages, IMessage } from './type';
import Vue from 'vue';
import { devtool } from '../../../src/plugins/devtool';

export const serviceKey = {
    CHAT: 'chatStore'
};

@store({
    root: true,
    identifier: serviceKey.CHAT,
    strict: true,
    devtool: true
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
        Vue.set(this.threads, id, {
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
        Vue.set(this.messages, message.id, message);
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

export default chatStore.getProvide();