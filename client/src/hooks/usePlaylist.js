import { useDispatch, useSelector } from 'react-redux';
import { fetchPlaylists, fetchPlaylistTracks, createPlaylist, addTrackToPlaylist, removeTrackFromPlaylist } from '../store/slices/playlistSlice';
import toast from 'react-hot-toast';

export function usePlaylist() {
  const dispatch = useDispatch();
  const { playlists, currentPlaylist, tracks, loading, tracksLoading } = useSelector((state) => state.playlist);

  const loadUserPlaylists = () => {
    dispatch(fetchPlaylists());
  };

  const loadTracks = (playlistId) => {
    dispatch(fetchPlaylistTracks(playlistId));
  };

  const handleCreatePlaylist = async (data) => {
    const res = await dispatch(createPlaylist(data));
    if (createPlaylist.fulfilled.match(res)) {
      toast.success(`Playlist "${res.payload.name}" created!`);
    } else {
      toast.error(res.payload || 'Failed to create playlist');
    }
  };

  const handleAddTrack = async (playlistId, trackData) => {
    const res = await dispatch(addTrackToPlaylist({ playlistId, trackData }));
    if (addTrackToPlaylist.fulfilled.match(res)) {
      toast.success('Track added to playlist!');
    } else {
      toast.error('Failed to add track');
    }
  };

  const handleRemoveTrack = async (playlistId, trackId) => {
    const res = await dispatch(removeTrackFromPlaylist({ playlistId, trackId }));
    if (removeTrackFromPlaylist.fulfilled.match(res)) {
      toast.success('Track removed');
    }
  };

  return {
    playlists,
    currentPlaylist,
    tracks,
    loading,
    tracksLoading,
    loadUserPlaylists,
    loadTracks,
    handleCreatePlaylist,
    handleAddTrack,
    handleRemoveTrack
  };
}
