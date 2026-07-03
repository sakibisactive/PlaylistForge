import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Music, Play, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { SkeletonLoader } from '../Common/SkeletonLoader';

export default function SharedPlaylistView() {
  const { shareId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadShared() {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/shared/${shareId}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Shared playlist not found');
      } finally {
        setLoading(false);
      }
    }
    loadShared();
  }, [shareId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <SkeletonLoader count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center space-y-4">
          <Lock className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Unavailable Link</h2>
          <p className="text-sm text-slate-400">{error}</p>
          <Link to="/" className="inline-block px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs">
            Return to PlaylistForge
          </Link>
        </div>
      </div>
    );
  }

  const { playlist, tracks, sharedBy, permission } = data;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-white transition font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to PlaylistForge
      </Link>

      <div className="glass-panel p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-6">
        <div className="w-36 h-36 rounded-2xl overflow-hidden shrink-0 shadow-2xl">
          <img
            src={playlist.coverImage || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&q=80'}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600/30 text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Shared by {sharedBy} ({permission} mode)
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{playlist.name}</h1>
          <p className="text-xs text-slate-400">{playlist.description || 'Public shared playlist'}</p>
        </div>
      </div>

      {/* Tracks Table */}
      <div className="glass-panel p-4 rounded-3xl space-y-3">
        <h3 className="text-sm font-bold text-white px-2">Playlist Tracks ({tracks.length})</h3>
        {tracks.map((t, idx) => (
          <div key={t.trackId} className="p-3 bg-slate-900/40 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-500 w-4">{idx + 1}</span>
              <img src={t.albumArt} alt={t.trackName} className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <h4 className="text-xs font-bold text-white">{t.trackName}</h4>
                <p className="text-[10px] text-slate-400">{(t.artists || []).join(', ')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
