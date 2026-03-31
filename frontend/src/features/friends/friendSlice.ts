import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axios';

interface FriendRequest {
  id: string;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
}

interface Friend {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  online: boolean;
}

interface FriendState {
  friends: Friend[];
  pendingRequests: FriendRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: FriendState = {
  friends: [],
  pendingRequests: [],
  loading: false,
  error: null,
};

export const fetchFriends = createAsyncThunk(
  'friends/fetchFriends',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/friends');
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch friends');
    }
  }
);

export const friendSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    setFriends: (state, action: PayloadAction<Friend[]>) => {
      state.friends = action.payload;
    },
    setPendingRequests: (state, action: PayloadAction<FriendRequest[]>) => {
      state.pendingRequests = action.payload;
    },
    addFriendRequest: (state, action: PayloadAction<FriendRequest>) => {
      state.pendingRequests.push(action.payload);
    },
    removeFriendRequest: (state, action: PayloadAction<string>) => {
      state.pendingRequests = state.pendingRequests.filter(r => r.id !== action.payload);
    },
    setFriendOnline: (state, action: PayloadAction<{ id: string; online: boolean }>) => {
      const friend = state.friends.find(f => f.id === action.payload.id);
      if (friend) friend.online = action.payload.online;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload;
        state.error = null;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFriends, setPendingRequests, addFriendRequest, removeFriendRequest, setFriendOnline } = friendSlice.actions;

export default friendSlice.reducer;
