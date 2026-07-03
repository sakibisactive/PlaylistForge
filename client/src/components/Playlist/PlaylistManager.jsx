import React, { useState } from 'react';
import { Plus, Globe, Lock, Music, Sparkles, Download, Share2 } from 'lucide-react';

export default function PlaylistManager({
  playlists,
  currentPlaylist,
  onSelectPlaylist,
  onCreatePlaylist,
  onOpenSmartModal,
  onOpenImportModal
}) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreatePlaylist({ name, description, isPublic });
    setName('');
    setDescription('');
    setIsPublic(false);
    setShowModal(false);
  };

  return (
    <div className="glass-panel p-4 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Music className="w-4 h-4 text-indigo-400" /> My Playlists ({playlists.length})
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-md"
          title="Create New Playlist"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tools Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={onOpenSmartModal}
          className="p-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <Sparkles className="w-3.5 h-3.5" /> AI Smart Mix
        </button>
        <button
          onClick={onOpenImportModal}
          className="p-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <Download className="w-3.5 h-3.5" /> Import URL
        </button>
      </div>

      {/* Playlist List */}
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {playlists.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs italic">
            No playlists yet. Create one above!
          </div>
        ) : (
          playlists.map((pl) => {
            const isSelected = currentPlaylist?.playlistId === pl.playlistId;
            return (
              <div
                key={pl.playlistId}
                onClick={() => onSelectPlaylist(pl)}
                className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between border ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border-indigo-500/50 shadow-md'
                    : 'bg-slate-900/40 hover:bg-white/5 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                    <img
                      src={pl.coverImage || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=150&q=80'}
                      alt={pl.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{pl.name}</h4>
                    <p className="text-[10px] text-slate-400">
                      {pl.trackCount || 0} tracks
                    </p>
                  </div>
                </div>

                <div>
                  {pl.isPublic ? (
                    <Globe className="w-3.5 h-3.5 text-emerald-400" title="Public Playlist" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-500" title="Private Playlist" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-6 rounded-2xl max-w-sm w-full border border-white/10 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-4">Create New Playlist</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Playlist Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer Coding Beats"
                  className="w-full glass-input px-3 py-2 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your playlist..."
                  className="w-full glass-input px-3 py-2 rounded-xl text-sm h-20"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="isPublic" className="text-xs text-slate-300 font-medium">Make Playlist Public</label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
