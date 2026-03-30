import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import chatReducer from '../features/chat/chatSlice';
import friendReducer from '../features/friends/friendSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    friends: friendReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
