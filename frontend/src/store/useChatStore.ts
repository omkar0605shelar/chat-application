import { create } from 'zustand';
import type { ChatListItem, Message } from '../types';

interface ChatState {
  chats: ChatListItem[];
  activeChat: ChatListItem | null;
  messages: Message[];
  loading: boolean;
  typingUsers: { [chatId: string]: string[] };
  onlineUsers: string[];
  
  setChats: (chats: ChatListItem[]) => void;
  setActiveChat: (chat: ChatListItem | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
  setOnlineUsers: (users: string[]) => void;
  markMessagesAsSeen: (chatId: string) => void;
  addReaction: (messageId: string, emoji: string, userId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChat: null,
  messages: [],
  loading: false,
  typingUsers: {},
  onlineUsers: [],

  setChats: (chats) => set({ chats }),
  setActiveChat: (activeChat) => set({ activeChat }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  updateMessage: (message) => set((state) => ({
    messages: state.messages.map((m) => m._id === message._id ? message : m)
  })),
  setLoading: (loading) => set({ loading }),
  setTyping: (chatId, userId, isTyping) => set((state) => {
    const currentTyping = state.typingUsers[chatId] || [];
    const newTyping = isTyping 
      ? [...new Set([...currentTyping, userId])]
      : currentTyping.filter((id) => id !== userId);
    return {
      typingUsers: { ...state.typingUsers, [chatId]: newTyping }
    };
  }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  markMessagesAsSeen: (chatId) => set((state) => ({
    messages: state.messages.map((m) => m.chatId === chatId ? { ...m, seen: true } : m)
  })),
  addReaction: (messageId, emoji, userId) => set((state) => ({
    messages: state.messages.map((m) => {
      if (m._id !== messageId) return m;
      const reactions = m.reactions || [];
      const existingReaction = reactions.find((r) => r.userId === userId && r.emoji === emoji);
      if (existingReaction) return m; // Already reacted with this emoji
      
      return {
        ...m,
        reactions: [...reactions.filter((r) => r.userId !== userId), { emoji, userId }]
      };
    })
  })),
}));
