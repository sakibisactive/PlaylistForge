import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import searchReducer from './slices/searchSlice';
import playlistReducer from './slices/playlistSlice';
import playerReducer from './slices/playerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    search: searchReducer,
    playlist: playlistReducer,
    player: playerReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;
