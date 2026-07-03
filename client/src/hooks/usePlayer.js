import { useDispatch, useSelector } from 'react-redux';
import { playTrack, togglePlayPause, setVolume } from '../store/slices/playerSlice';

export function usePlayer() {
  const dispatch = useDispatch();
  const player = useSelector((state) => state.player);

  const startPlayback = (track) => {
    dispatch(playTrack(track));
  };

  const togglePlayback = () => {
    dispatch(togglePlayPause());
  };

  const changeVolume = (val) => {
    dispatch(setVolume(val));
  };

  return {
    ...player,
    startPlayback,
    togglePlayback,
    changeVolume
  };
}
