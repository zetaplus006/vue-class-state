
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

export interface IThreads {
    id: string;
    name: string;
    messages: string[];
    lastMessage: IMessage;
}

export interface IThreadsData { [id: string]: IThreads; }