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

export interface Friend {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
}

export interface FriendRequest {
    _id: string;
    from: User;
    to: User;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

export interface Notification {
    id: string;
    type: 'message' | 'friend_request' | 'missed_call' | 'friend_accepted';
    title: string;
    body: string;
    timestamp: string;
    read: boolean;
    meta?: Record<string, string>;
}

export interface AIMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    isLoading?: boolean;
}

export type CallStatus = 'idle' | 'calling' | 'receiving' | 'in-call' | 'ended';

export interface CallState {
    status: CallStatus;
    peerId?: string;
    peerName?: string;
    isVideoOn: boolean;
    isMuted: boolean;
    signal?: unknown;
}
