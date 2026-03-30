import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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
});

export const { setFriends, setPendingRequests, addFriendRequest, removeFriendRequest, setFriendOnline } = friendSlice.actions;

export default friendSlice.reducer;
