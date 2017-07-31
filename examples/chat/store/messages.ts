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
