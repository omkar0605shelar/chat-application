export interface User {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
}

export interface Message {
    _id: string;
    chatId: string;
    sender: string;
    text: string;
    messageType: 'text' | 'image';
    image?: {
        url: string;
        publicId: string;
    };
    seen: boolean;
    seenAt?: string;
    createdAt: string;
}

export interface Chat {
    _id: string;
    users: string[];
    latestMessage?: {
        text: string;
        sender: string;
    };
    unseenCount: number;
    updatedAt: string;
}

export interface ChatWithUser {
    user: User;
    chat: Chat;
}
