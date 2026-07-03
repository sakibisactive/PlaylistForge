import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

const tokenFromStorage = localStorage.getItem('playlistforge_token');

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const res = await axiosClient.post('/auth/register', userData);
    localStorage.setItem('playlistforge_token', res.data.token);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await axiosClient.post('/auth/login', credentials);
    localStorage.setItem('playlistforge_token', res.data.token);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosClient.get('/auth/me');
    return res.data;
  } catch (err) {
    return rejectWithValue('Session expired');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: tokenFromStorage || null,
    isAuthenticated: !!tokenFromStorage,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('playlistforge_token');
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('playlistforge_token', action.payload);
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('playlistforge_token');
      });
  }
});

export const { logout, setToken, clearError } = authSlice.actions;
export default authSlice.reducer;
