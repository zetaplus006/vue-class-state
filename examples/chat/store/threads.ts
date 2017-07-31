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

