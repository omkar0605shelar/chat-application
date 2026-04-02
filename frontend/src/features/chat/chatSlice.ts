import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { chatApi } from '../../api/axios';

interface Message {
  _id?: string;
  id?: string;
  sender: string;
  chatId: string;
  text?: string;
  content?: string;
  messageType?: string;
  type?: 'text' | 'image';
  createdAt?: string;
  seen?: boolean;
  image?: { url: string; publicId: string; };
}

interface Chat {
  _id: string;
  users: string[];
  latestMessage?: {
    text: string;
    sender: string;
  };
  unseenCount: number;
  updatedAt: string;
}

interface ChatListItem {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: { url: string; publicId: string };
  };
  chat: Chat;
}

interface ChatState {
  chats: ChatListItem[];
  activeChat: ChatListItem | null;
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

export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await chatApi.get('/chat/all');
      return res.data.chats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chats');
    }
  }
);

export const createChat = createAsyncThunk(
  'chat/createChat',
  async (otherUserId: string, { rejectWithValue, dispatch }) => {
    try {
      const res = await chatApi.post('/chat/new', { otherUserId });
      const chatId = res.data.chatId;
      
      // Re-fetch chats to get the full object (including user data)
      const action = await dispatch(fetchChats());
      
      if (fetchChats.fulfilled.match(action)) {
        const chats = action.payload as ChatListItem[];
        const newActiveChat = chats.find(c => c.chat._id === chatId);
        if (newActiveChat) {
          dispatch(setActiveChat(newActiveChat));
        }
      }
      
      return chatId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create chat');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (chatId: string, { rejectWithValue }) => {
    try {
      const res = await chatApi.get(`/message/${chatId}`);
      return res.data.messages;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessageToBackend = createAsyncThunk(
  'chat/sendMessageToBackend',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await chatApi.post('/message', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data.message;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<ChatListItem[]>) => {
      state.chats = action.payload;
    },
    setActiveChat: (state, action: PayloadAction<ChatListItem | null>) => {
      state.activeChat = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      // Update lastMessage and reorder chats
      const chatItem = state.chats.find(c => c.chat._id === action.payload.chatId);
      if (chatItem) {
        chatItem.chat.latestMessage = {
          text: action.payload.text || action.payload.content || '',
          sender: action.payload.sender
        };
        chatItem.chat.updatedAt = action.payload.createdAt || new Date().toISOString();
        if (!state.activeChat || state.activeChat.chat._id !== action.payload.chatId) {
          chatItem.chat.unseenCount += 1;
        }
      }
    },
    markSeen: (state, action: PayloadAction<{ chatId: string }>) => {
      const chatItem = state.chats.find(c => c.chat._id === action.payload.chatId);
      if (chatItem) {
        chatItem.chat.unseenCount = 0;
      }
      state.messages = state.messages.map(m => 
        m.chatId === action.payload.chatId ? { ...m, seen: true } : m
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
        state.error = null;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(sendMessageToBackend.fulfilled, (state, action) => {
        state.messages.push(action.payload);
        const chatItem = state.chats.find(c => c.chat._id === action.payload.chatId);
        if (chatItem) {
          chatItem.chat.latestMessage = {
            text: action.payload.text || action.payload.content || '',
            sender: action.payload.sender
          };
          chatItem.chat.updatedAt = action.payload.createdAt || new Date().toISOString();
        }
      });
  },
});

export const { setChats, setActiveChat, setMessages, addMessage, markSeen, setLoading } = chatSlice.actions;

export default chatSlice.reducer;
