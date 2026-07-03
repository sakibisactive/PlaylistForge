import { createSlice } from '@reduxjs/toolkit';

const playerSlice = createSlice({
  name: 'player',
  initialState: {
    currentTrack: null,
    isPlaying: false,
    volume: 0.8,
    progress: 0,
    duration: 0,
    queue: []
  },
  reducers: {
    playTrack: (state, action) => {
      state.currentTrack = action.payload;
      state.isPlaying = true;
      state.progress = 0;
      state.duration = action.payload.durationMs || 180000;
    },
    togglePlayPause: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
    setQueue: (state, action) => {
      state.queue = action.payload;
    }
  }
});

export const { playTrack, togglePlayPause, setVolume, setProgress, setQueue } = playerSlice.actions;
export default playerSlice.reducer;
