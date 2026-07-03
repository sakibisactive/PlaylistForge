import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const executeSearch = createAsyncThunk('search/execute', async (query, { rejectWithValue }) => {
  try {
    const res = await axiosClient.get(`/search?q=${encodeURIComponent(query)}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Search failed');
  }
});

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    results: [],
    cached: false,
    filter: 'all', // 'all', 'track', 'artist', 'album'
    loading: false,
    error: null
  },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(executeSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.tracks || [];
        state.cached = action.payload.cached || false;
      })
      .addCase(executeSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setQuery, setFilter, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
