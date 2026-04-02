export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: {
    url: string;
    publicId: string;
  };
  online?: boolean;
}

export interface Reaction {
  emoji: string;
  userId: string;
}

export interface Message {
  _id: string;
  sender: string;
  chatId: string;
  text?: string;
  content?: string;
  messageType?: "text" | "image" | "video" | "call";
  type?: "text" | "image" | "video" | "call";
  createdAt: string;
  seen: boolean;
  image?: {
    url: string;
    publicId: string;
  };
  video?: {
    url: string;
    publicId: string;
  };
  reactions?: Reaction[];
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

export interface ChatListItem {
  user: User;
  chat: Chat;
}

export interface FriendRequest {
  _id: string;
  sender: User;
  receiver: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "message" | "friend-request" | "missed-call";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface CallState {
  status: "idle" | "calling" | "ringing" | "in-call";
  type: "audio" | "video";
  targetUser?: User;
  isInitiator: boolean;
  stream?: MediaStream;
  remoteStream?: MediaStream;
  peer?: any;
}
