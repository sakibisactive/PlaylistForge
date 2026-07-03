import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Download, Link2, X } from 'lucide-react';

export default function ImportModal({ onClose, onSuccess }) {
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!spotifyUrl) return;
    try {
      setLoading(true);
      const res = await axiosClient.post('/playlists/import', { spotifyUrl });
      toast.success(res.data.message);
      onSuccess(res.data.playlist);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to import Spotify playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-indigo-500/30 relative animate-in fade-in zoom-in-95">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-indigo-600/30 text-indigo-300 rounded-2xl border border-indigo-500/30">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Import Spotify Playlist</h3>
            <p className="text-xs text-slate-400">Paste Spotify Playlist Web URL</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Spotify Playlist Link / URI</label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                placeholder="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"
                className="w-full glass-input pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition text-xs"
          >
            {loading ? 'Fetching Spotify Playlist...' : 'Import Tracks into PlaylistForge'}
          </button>
        </form>
      </div>
    </div>
  );
}
