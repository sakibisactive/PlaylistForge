import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Disc } from 'lucide-react';

const formatTime = (ms) => {
  const sec = Math.floor((ms / 1000) % 60);
  const min = Math.floor((ms / (1000 * 60)) % 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

// Fallback high quality audio sample previews
const AUDIO_SAMPLES = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
];

export default function PlaylistPlayer({ currentTrack, isPlaying, onTogglePlay, volume, onChangeVolume }) {
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);

  // Get track preview URL or fallback sample based on track ID
  const getAudioSrc = (track) => {
    if (!track) return null;
    if (track.previewUrl) return track.previewUrl;
    // Hash track name to pick consistent audio sample
    let hash = 0;
    const str = track.spotifyTrackId || track.trackName || 'track';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % AUDIO_SAMPLES.length;
    return AUDIO_SAMPLES[idx];
  };

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    const src = getAudioSrc(currentTrack);
    if (audioRef.current.src !== src) {
      audioRef.current.src = src;
      audioRef.current.load();
    }

    if (isPlaying) {
      audioRef.current.play().catch((err) => console.log('Audio autoplay prevented:', err));
    } else {
      audioRef.current.pause();
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime * 1000);
    }
  };

  const handleEnded = () => {
    onTogglePlay();
    setProgress(0);
  };

  const handleSeek = (e) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (audioRef.current) {
      audioRef.current.currentTime = newProgress / 1000;
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 px-4 py-3 bg-slate-950/90 backdrop-blur-2xl">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Track Details */}
        <div className="flex items-center gap-3 w-1/4 min-w-0">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-lg">
            <img
              src={currentTrack.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80'}
              alt={currentTrack.trackName}
              className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Disc className="w-5 h-5 text-indigo-400 animate-spin" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{currentTrack.trackName}</h4>
            <p className="text-[10px] text-slate-400 truncate">
              {(currentTrack.artists || []).join(', ')}
            </p>
          </div>
        </div>

        {/* Playback Controls & Progress */}
        <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-md">
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white transition">
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePlay}
              className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-full shadow-lg shadow-indigo-500/30 transition transform hover:scale-105"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <button className="text-slate-400 hover:text-white transition">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span>{formatTime(progress)}</span>
            <input
              type="range"
              min="0"
              max={audioRef.current?.duration ? audioRef.current.duration * 1000 : currentTrack.durationMs || 180000}
              value={progress}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
            <span>{formatTime(audioRef.current?.duration ? audioRef.current.duration * 1000 : currentTrack.durationMs || 180000)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-end gap-2 w-1/4">
          <button
            onClick={() => onChangeVolume(volume === 0 ? 0.8 : 0)}
            className="text-slate-400 hover:text-white transition"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hidden sm:block"
          />
        </div>
      </div>
    </div>
  );
}
