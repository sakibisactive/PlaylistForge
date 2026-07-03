import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { ShieldCheck, Lock, Users, Library, Music, Download, Radio, RefreshCw, Zap, Activity } from 'lucide-react';

export default function AdminDashboard({ onClose }) {
  const [adminPassword, setAdminPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [targetUser, setTargetUser] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  const handleUnlock = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/analytics', {
        headers: { 'x-admin-password': adminPassword }
      });
      setAnalytics(res.data);
      setUnlocked(true);
      toast.success('Admin Dashboard Unlocked!');
    } catch (err) {
      toast.error('Invalid Master Admin Password');
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = async (action) => {
    try {
      const res = await axiosClient.post('/admin/override', {
        action,
        username: targetUser,
        broadcastMessage: broadcastMsg
      }, {
        headers: { 'x-admin-password': adminPassword }
      });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Override action failed');
    }
  };

  const handleExportCSV = () => {
    window.open(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/export?adminPassword=${encodeURIComponent(adminPassword)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-3xl w-full border border-amber-500/30 relative my-8 animate-in fade-in zoom-in-95">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white font-bold text-sm">
          ✕ Close
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Instructor Admin Dashboard</h2>
            <p className="text-xs text-slate-400">System Monitoring & Manual Override Controls</p>
          </div>
        </div>

        {!unlocked ? (
          <form onSubmit={handleUnlock} className="space-y-4 max-w-sm mx-auto py-8">
            <div className="text-center space-y-2">
              <Lock className="w-10 h-10 text-amber-400 mx-auto opacity-80" />
              <h3 className="text-sm font-bold text-white">Enter Master Password</h3>
              <p className="text-xs text-slate-400">Default password: <code className="text-amber-300">forgeadmin123</code></p>
            </div>
            <input
              type="password"
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Master Admin Password"
              className="w-full glass-input px-4 py-2.5 rounded-xl text-sm text-center"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl shadow-lg transition text-xs"
            >
              {loading ? 'Authenticating...' : 'Unlock Dashboard'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Analytics Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900/60 rounded-2xl border border-white/5 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Users className="w-3 h-3 text-indigo-400" /> Users</p>
                <p className="text-xl font-extrabold text-white">{analytics.metrics.totalUsers}</p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-2xl border border-white/5 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Library className="w-3 h-3 text-purple-400" /> Playlists</p>
                <p className="text-xl font-extrabold text-white">{analytics.metrics.totalPlaylists}</p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-2xl border border-white/5 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Music className="w-3 h-3 text-emerald-400" /> Tracks</p>
                <p className="text-xl font-extrabold text-white">{analytics.metrics.totalTracks}</p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-2xl border border-white/5 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> Cache Hit Rate</p>
                <p className="text-xl font-extrabold text-amber-300">{analytics.cacheStats.hitRate}</p>
              </div>
            </div>

            {/* Top Added Tracks & Redis Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">🔥 Most Added Tracks</h4>
                {analytics.topTracks.length === 0 ? (
                  <p className="text-xs text-slate-500">No tracks added yet</p>
                ) : (
                  analytics.topTracks.map((t) => (
                    <div key={t._id} className="flex justify-between text-xs text-slate-300 py-1 border-b border-slate-800/40">
                      <span className="truncate">{t.trackName}</span>
                      <span className="font-mono text-indigo-400">{t.count}x</span>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">⚡ Redis & Spotify API Stats</h4>
                <div className="text-xs space-y-1 text-slate-300">
                  <p>Cache Hits: <span className="text-emerald-400 font-mono">{analytics.cacheStats.hits}</span></p>
                  <p>Cache Misses: <span className="text-rose-400 font-mono">{analytics.cacheStats.misses}</span></p>
                  <p>Spotify API Calls: <span className="text-indigo-400 font-mono">{analytics.spotifyStats.callsMade}</span></p>
                  <p>Mode: <span className="text-amber-400 font-bold">{analytics.spotifyStats.isMockMode ? 'Mock / Seed Fallback' : 'Live Spotify API'}</span></p>
                </div>
              </div>
            </div>

            {/* Instructor Manual Overrides */}
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-amber-500/20 space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> Instructor Manual Override System
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={targetUser}
                    onChange={(e) => setTargetUser(e.target.value)}
                    placeholder="Username to override"
                    className="w-full glass-input px-3 py-1.5 rounded-lg text-xs"
                  />
                  <button
                    onClick={() => handleOverride('RESET_SPOTIFY_TOKEN')}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg text-xs font-semibold"
                  >
                    Reset User Spotify Tokens
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="System announcement text"
                    className="w-full glass-input px-3 py-1.5 rounded-lg text-xs"
                  />
                  <button
                    onClick={() => handleOverride('BROADCAST_MESSAGE')}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Radio className="w-3.5 h-3.5" /> Broadcast Live Message
                  </button>
                </div>
              </div>
            </div>

            {/* CSV Export Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
              >
                <Download className="w-4 h-4" /> Export Playlist Data CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
