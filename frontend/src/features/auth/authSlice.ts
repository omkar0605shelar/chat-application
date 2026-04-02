import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axios';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: { url: string; publicId: string };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  isInitialized: !localStorage.getItem('token'), // If no token, it's already "initialized" as guest
};

export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/me');
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Session expired');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await api.post('/update/profile', formData);
      return res.data; // { message, user, token }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      localStorage.removeItem('token');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.isInitialized = true;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.isInitialized = true;
        localStorage.removeItem('token');
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, logout, setLoading, setError } = authSlice.actions;

export default authSlice.reducer;
