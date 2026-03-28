import { create } from 'zustand';
import type { ChatWithUser, Message } from '../types';

interface ChatStore {
    chats: ChatWithUser[];
    selectedChat: ChatWithUser | null;
    messages: Message[];
    onlineUsers: string[];
    isTyping: boolean;
    isLoadingChats: boolean;
    isLoadingMessages: boolean;

    setChats: (chats: ChatWithUser[]) => void;
    setSelectedChat: (chat: ChatWithUser | null) => void;
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    setOnlineUsers: (users: string[]) => void;
    setTyping: (isTyping: boolean) => void;
    setLoadingChats: (loading: boolean) => void;
    setLoadingMessages: (loading: boolean) => void;
    updateUnseenCount: (chatId: string, count: number) => void;
    markChatRead: (chatId: string) => void;
    updateLatestMessage: (chatId: string, text: string, sender: string) => void;
    markMessagesSeen: (chatId: string, seenAt: string) => void;
    bumpChatToTop: (chatId: string, text: string, sender: string) => void;
    incrementUnseenCount: (chatId: string, text: string, sender: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    chats: [],
    selectedChat: null,
    messages: [],
    onlineUsers: [],
    isTyping: false,
    isLoadingChats: false,
    isLoadingMessages: false,

    setChats: (chats) => set({ chats }),
    setSelectedChat: (selectedChat) => set({ selectedChat }),
    setMessages: (messages) => set({ messages }),
    addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
    setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
    setTyping: (isTyping) => set({ isTyping }),
    setLoadingChats: (isLoadingChats) => set({ isLoadingChats }),
    setLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),

    updateUnseenCount: (chatId, count) =>
        set((state) => ({
            chats: state.chats.map((c) =>
                c.chat._id === chatId
                    ? { ...c, chat: { ...c.chat, unseenCount: count } }
                    : c
            ),
        })),

    markChatRead: (chatId) =>
        set((state) => ({
            chats: state.chats.map((c) =>
                c.chat._id === chatId
                    ? { ...c, chat: { ...c.chat, unseenCount: 0 } }
                    : c
            ),
        })),

    updateLatestMessage: (chatId, text, sender) =>
        set((state) => ({
            chats: state.chats.map((c) =>
                c.chat._id === chatId
                    ? {
                          ...c,
                          chat: {
                              ...c.chat,
                              latestMessage: { text, sender },
                              updatedAt: new Date().toISOString(),
                          },
                      }
                    : c
            ),
        })),

    markMessagesSeen: (chatId, seenAt) =>
        set((state) => ({
            messages:
                state.selectedChat?.chat._id === chatId
                    ? state.messages.map((m) => ({ ...m, seen: true, seenAt: m.seenAt || seenAt }))
                    : state.messages,
        })),

    bumpChatToTop: (chatId, text, sender) =>
        set((state) => ({
            chats: state.chats
                .map((c) =>
                    c.chat._id === chatId
                        ? {
                              ...c,
                              chat: {
                                  ...c.chat,
                                  latestMessage: { text, sender },
                                  updatedAt: new Date().toISOString(),
                              },
                          }
                        : c
                )
                .sort(
                    (a, b) =>
                        new Date(b.chat.updatedAt).getTime() -
                        new Date(a.chat.updatedAt).getTime()
                ),
        })),

    incrementUnseenCount: (chatId, text, sender) =>
        set((state) => ({
            chats: state.chats
                .map((c) =>
                    c.chat._id === chatId
                        ? {
                              ...c,
                              chat: {
                                  ...c.chat,
                                  unseenCount: c.chat.unseenCount + 1,
                                  latestMessage: { text, sender },
                                  updatedAt: new Date().toISOString(),
                              },
                          }
                        : c
                )
                .sort(
                    (a, b) =>
                        new Date(b.chat.updatedAt).getTime() -
                        new Date(a.chat.updatedAt).getTime()
                ),
        })),
}));
