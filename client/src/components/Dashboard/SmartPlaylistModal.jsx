import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Sparkles, Sliders, X, Zap } from 'lucide-react';

export default function SmartPlaylistModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [energy, setEnergy] = useState(0.8);
  const [danceability, setDanceability] = useState(0.7);
  const [valence, setValence] = useState(0.6);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axiosClient.post('/playlists/smart', {
        name,
        energy,
        danceability,
        valence,
        limit: 8
      });
      toast.success(res.data.message);
      onSuccess(res.data.playlist);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Smart playlist generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-purple-500/30 relative animate-in fade-in zoom-in-95">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-purple-600/30 text-purple-300 rounded-2xl border border-purple-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Smart Playlist Generator</h3>
            <p className="text-xs text-slate-400">Spotify Audio Features API Engine</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Playlist Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. High Energy Workout Mix"
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
            />
          </div>

          <div className="space-y-3 p-3 bg-slate-900/60 rounded-2xl border border-white/5">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">⚡ Energy</span>
                <span className="text-indigo-400 font-mono">{(energy * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range" min="0" max="1" step="0.05"
                value={energy} onChange={(e) => setEnergy(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">💃 Danceability</span>
                <span className="text-purple-400 font-mono">{(danceability * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range" min="0" max="1" step="0.05"
                value={danceability} onChange={(e) => setDanceability(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">😊 Valence (Happiness)</span>
                <span className="text-emerald-400 font-mono">{(valence * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range" min="0" max="1" step="0.05"
                value={valence} onChange={(e) => setValence(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition text-xs flex items-center justify-center gap-2"
          >
            {loading ? 'Synthesizing Smart Mix...' : <><Zap className="w-4 h-4" /> Generate Smart Playlist</>}
          </button>
        </form>
      </div>
    </div>
  );
}
