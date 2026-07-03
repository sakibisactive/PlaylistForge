import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Play, Trash2, GripVertical, ChevronUp, ChevronDown, Share2, Music2, Clock, Globe, Lock } from 'lucide-react';
import io from 'socket.io-client';

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export default function PlaylistViewer({
  playlist,
  tracks,
  loading,
  onRemoveTrack,
  onReorderTracks,
  onPlayTrack,
  onOpenShareModal
}) {
  const [localTracks, setLocalTracks] = useState(tracks || []);

  useEffect(() => {
    setLocalTracks(tracks || []);
  }, [tracks]);

  // Socket.io real-time collaborative updates listener
  useEffect(() => {
    if (!playlist) return;
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl);

    socket.emit('join_playlist', playlist.playlistId);

    socket.on('playlist_updated', (data) => {
      if (data.actionType === 'TRACK_ADDED') {
        setLocalTracks((prev) => [...prev, data.payload]);
      } else if (data.actionType === 'TRACK_REMOVED') {
        setLocalTracks((prev) => prev.filter(t => t.trackId !== data.payload.trackId));
      }
    });

    return () => {
      socket.emit('leave_playlist', playlist.playlistId);
      socket.disconnect();
    };
  }, [playlist]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(localTracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalTracks(items);
    const newTrackIds = items.map(t => t.trackId);
    onReorderTracks(playlist.playlistId, newTrackIds);
  };

  const handleMove = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localTracks.length) return;

    const items = Array.from(localTracks);
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    setLocalTracks(items);
    onReorderTracks(playlist.playlistId, items.map(t => t.trackId));
  };

  if (!playlist) {
    return (
      <div className="glass-panel p-12 rounded-2xl text-center text-slate-400">
        <Music2 className="w-16 h-16 mx-auto mb-3 opacity-30 text-indigo-400" />
        <h3 className="text-lg font-bold text-white mb-1">Select a Playlist</h3>
        <p className="text-sm">Choose a playlist from the sidebar or search tracks to add!</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-700/60">
        <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-white/10">
          <img
            src={playlist.coverImage || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&q=80'}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 bg-indigo-600/30 text-indigo-300 rounded-full border border-indigo-500/30">
              PLAYLIST
            </span>
            {playlist.isPublic ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1"><Globe className="w-3 h-3" /> Public</span>
            ) : (
              <span className="text-xs text-slate-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Private</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{playlist.name}</h1>
          {playlist.description && <p className="text-xs text-slate-400 max-w-lg">{playlist.description}</p>}
          <div className="flex items-center justify-center sm:justify-start gap-4 pt-1">
            <button
              onClick={() => onOpenShareModal(playlist)}
              className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition"
            >
              <Share2 className="w-4 h-4" /> Share Playlist
            </button>
            <span className="text-xs text-slate-400 font-medium">{localTracks.length} tracks</span>
          </div>
        </div>
      </div>

      {/* Tracks Table / Drag Drop Context */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 animate-pulse">Loading playlist tracks...</div>
      ) : localTracks.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          This playlist is empty. Search for songs to add tracks!
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="playlist-tracks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {localTracks.map((track, index) => (
                  <Draggable key={track.trackId} draggableId={track.trackId} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-3 rounded-xl flex items-center justify-between gap-4 transition border ${
                          snapshot.isDragging
                            ? 'bg-indigo-900/90 border-indigo-500 shadow-2xl scale-[1.02] z-50'
                            : 'bg-slate-900/40 hover:bg-white/5 border-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Drag Handle */}
                          <div {...provided.dragHandleProps} className="text-slate-500 hover:text-slate-300 cursor-grab">
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <span className="text-xs font-mono font-bold text-slate-400 w-4 text-center">{index + 1}</span>

                          {/* Album Art */}
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 group">
                            <img
                              src={track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=100&q=80'}
                              alt={track.trackName}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => onPlayTrack(track)}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                            >
                              <Play className="w-4 h-4 text-white fill-white" />
                            </button>
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{track.trackName}</h4>
                            <p className="text-[11px] text-slate-400 truncate">
                              {(track.artists || []).join(', ')} • {track.albumName}
                            </p>
                          </div>
                        </div>

                        {/* Actions & Reordering Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono text-slate-400 hidden sm:inline mr-2">
                            {formatDuration(track.durationMs)}
                          </span>

                          <div className="flex flex-col">
                            <button
                              disabled={index === 0}
                              onClick={() => handleMove(index, 'up')}
                              className="text-slate-500 hover:text-white disabled:opacity-20 transition"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={index === localTracks.length - 1}
                              onClick={() => handleMove(index, 'down')}
                              className="text-slate-500 hover:text-white disabled:opacity-20 transition"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveTrack(playlist.playlistId, track.trackId)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Remove from playlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
