import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Disc } from 'lucide-react';

const formatTime = (ms) => {
  const sec = Math.floor((ms / 1000) % 60);
  const min = Math.floor((ms / (1000 * 60)) % 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

export default function PlaylistPlayer({ currentTrack, isPlaying, onTogglePlay, volume, onChangeVolume }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= (currentTrack.durationMs || 180000)) {
            onTogglePlay();
            return 0;
          }
          return prev + 1000;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, onTogglePlay]);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 px-4 py-3 bg-slate-950/90 backdrop-blur-2xl">
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
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${(progress / (currentTrack.durationMs || 180000)) * 100}%` }}
              />
            </div>
            <span>{formatTime(currentTrack.durationMs || 180000)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-end gap-2 w-1/4">
          <button className="text-slate-400 hover:text-white transition">
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
