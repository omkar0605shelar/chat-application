import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  sender: string;
  chatId: string;
  content: string;
  type: 'text' | 'image';
  createdAt: string;
  seen: boolean;
}

interface Chat {
  id: string;
  participants: any[];
  lastMessage?: string;
  unseenCount: number;
  updatedAt: string;
}

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  activeChat: null,
  messages: [],
  loading: false,
  error: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    setActiveChat: (state, action: PayloadAction<Chat | null>) => {
      state.activeChat = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      // Update lastMessage and reorder chats
      const chatIndex = state.chats.findIndex(c => c.id === action.payload.chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = action.payload.content;
        state.chats[chatIndex].updatedAt = action.payload.createdAt;
        if (!state.activeChat || state.activeChat.id !== action.payload.chatId) {
          state.chats[chatIndex].unseenCount += 1;
        }
      }
    },
    markSeen: (state, action: PayloadAction<{ chatId: string }>) => {
      const chatIndex = state.chats.findIndex(c => c.id === action.payload.chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].unseenCount = 0;
      }
      state.messages = state.messages.map(m => 
        m.chatId === action.payload.chatId ? { ...m, seen: true } : m
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setChats, setActiveChat, setMessages, addMessage, markSeen, setLoading } = chatSlice.actions;

export default chatSlice.reducer;
