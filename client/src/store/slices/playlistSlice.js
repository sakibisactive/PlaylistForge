import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchPlaylists = createAsyncThunk('playlist/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosClient.get('/playlists');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch playlists');
  }
});

export const fetchPlaylistTracks = createAsyncThunk('playlist/fetchTracks', async (playlistId, { rejectWithValue }) => {
  try {
    const res = await axiosClient.get(`/playlists/${playlistId}/tracks`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch playlist tracks');
  }
});

export const createPlaylist = createAsyncThunk('playlist/create', async (playlistData, { rejectWithValue }) => {
  try {
    const res = await axiosClient.post('/playlists', playlistData);
    return res.data.playlist;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create playlist');
  }
});

export const addTrackToPlaylist = createAsyncThunk('playlist/addTrack', async ({ playlistId, trackData }, { rejectWithValue }) => {
  try {
    const res = await axiosClient.post(`/playlists/${playlistId}/tracks`, trackData);
    return { playlistId, track: res.data.track };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add track');
  }
});

export const removeTrackFromPlaylist = createAsyncThunk('playlist/removeTrack', async ({ playlistId, trackId }, { rejectWithValue }) => {
  try {
    await axiosClient.delete(`/playlists/${playlistId}/tracks/${trackId}`);
    return { playlistId, trackId };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove track');
  }
});

export const reorderTracks = createAsyncThunk('playlist/reorder', async ({ playlistId, trackIds }, { rejectWithValue }) => {
  try {
    await axiosClient.put(`/playlists/${playlistId}/reorder`, { trackIds });
    return { playlistId, trackIds };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to reorder tracks');
  }
});

const playlistSlice = createSlice({
  name: 'playlist',
  initialState: {
    playlists: [],
    currentPlaylist: null,
    tracks: [],
    loading: false,
    tracksLoading: false,
    error: null
  },
  reducers: {
    setCurrentPlaylist: (state, action) => {
      state.currentPlaylist = action.payload;
    },
    updateTracksLocally: (state, action) => {
      state.tracks = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Playlists
      .addCase(fetchPlaylists.pending, (state) => { state.loading = true; })
      .addCase(fetchPlaylists.fulfilled, (state, action) => {
        state.loading = false;
        state.playlists = action.payload.playlists || [];
        if (!state.currentPlaylist && state.playlists.length > 0) {
          state.currentPlaylist = state.playlists[0];
        }
      })
      .addCase(fetchPlaylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Tracks
      .addCase(fetchPlaylistTracks.pending, (state) => { state.tracksLoading = true; })
      .addCase(fetchPlaylistTracks.fulfilled, (state, action) => {
        state.tracksLoading = false;
        state.tracks = action.payload.tracks || [];
      })
      .addCase(fetchPlaylistTracks.rejected, (state) => {
        state.tracksLoading = false;
      })
      // Create Playlist
      .addCase(createPlaylist.fulfilled, (state, action) => {
        state.playlists.unshift(action.payload);
        state.currentPlaylist = action.payload;
        state.tracks = [];
      })
      // Add Track Optimistically / Fulfilled
      .addCase(addTrackToPlaylist.fulfilled, (state, action) => {
        if (state.currentPlaylist && state.currentPlaylist.playlistId === action.payload.playlistId) {
          state.tracks.push(action.payload.track);
        }
      })
      // Remove Track
      .addCase(removeTrackFromPlaylist.fulfilled, (state, action) => {
        if (state.currentPlaylist && state.currentPlaylist.playlistId === action.payload.playlistId) {
          state.tracks = state.tracks.filter(t => t.trackId !== action.payload.trackId);
        }
      });
  }
});

export const { setCurrentPlaylist, updateTracksLocally } = playlistSlice.actions;
export default playlistSlice.reducer;
