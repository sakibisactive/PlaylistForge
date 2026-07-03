import React, { useState } from 'react';
import { Play, Plus, Music, Check } from 'lucide-react';

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const TrackItem = React.memo(({ track, playlists, onAddTrack, onPlayTrack }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [addedPlaylists, setAddedPlaylists] = useState(new Set());

  const handleAdd = (playlistId) => {
    onAddTrack(playlistId, track);
    setAddedPlaylists((prev) => new Set(prev).add(playlistId));
    setShowDropdown(false);
  };

  return (
    <div className="glass-panel p-3 rounded-xl flex items-center justify-between gap-4 hover:bg-white/5 transition group">
      <div className="flex items-center gap-3 min-w-0">
        {/* Album Art with Play Hover Overlay */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 group-hover:shadow-md">
          <img
            src={track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80'}
            alt={track.trackName}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => onPlayTrack(track)}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
          >
            <Play className="w-5 h-5 text-white fill-white" />
          </button>
        </div>

        {/* Track Title & Artist */}
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition">
            {track.trackName}
          </h4>
          <p className="text-xs text-slate-400 truncate">
            {(track.artists || []).join(', ')} • <span className="text-slate-500">{track.albumName}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span className="text-xs font-mono text-slate-400 hidden sm:inline">
          {formatDuration(track.durationMs)}
        </span>

        {/* Add to Playlist Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add to Playlist</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 glass-panel p-1.5 rounded-xl shadow-2xl z-30 border border-slate-700/60 animate-in fade-in zoom-in-95">
              <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Select Playlist</p>
              {playlists.length === 0 ? (
                <p className="text-xs text-slate-500 p-2 italic">No playlists created yet</p>
              ) : (
                playlists.map((pl) => (
                  <button
                    key={pl.playlistId}
                    onClick={() => handleAdd(pl.playlistId)}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-indigo-600/40 rounded-lg transition flex items-center justify-between"
                  >
                    <span className="truncate">{pl.name}</span>
                    {addedPlaylists.has(pl.playlistId) && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default TrackItem;
