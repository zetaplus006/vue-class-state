import { store } from './decorator';
import { Service, mutation } from 'vubx';

export interface IMessage {
    id: string;
    threadID: string;
    threadName: string;
    authorName: string;
    text: string;
    timestamp: string;
    isRead?: boolean;
}

export interface IMessages { [id: string]: IMessage; }

@store()
export class MessageStore extends Service {
    messages: IMessages = {};

    @mutation
    addMessages(message: IMessage) {
        this.$set(this.messages, message.id, message);
    }
}