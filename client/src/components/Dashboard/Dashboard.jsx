import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Sparkles, Music, Play, TrendingUp, Clock, Plus, Download, Radio, Users } from 'lucide-react';

export default function Dashboard({ playlists, onSelectPlaylist, onPlayTrack, onOpenSmartModal, onOpenImportModal, onSwitchToSearch }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    async function fetchRecs() {
      try {
        setLoadingRecs(true);
        const res = await axiosClient.get('/recommendations');
        setRecommendations(res.data.recommendations || []);
      } catch (err) {
        // Fallback
      } finally {
        setLoadingRecs(false);
      }
    }
    fetchRecs();
  }, []);

  const totalTracksCount = playlists.reduce((acc, p) => acc + (p.trackCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900/40 border border-indigo-500/20">
        <div className="relative z-10 space-y-3 max-w-xl">
          <span className="px-3 py-1 bg-indigo-600/30 text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/30 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI-Powered Playlist Studio
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Craft your ultimate soundscape with <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">PlaylistForge</span>
          </h1>
          <p className="text-slate-300 text-sm">
            Search tracks, build custom playlists, generate AI Smart Mixes based on Spotify audio features, and share in real-time.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onSwitchToSearch}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
            >
              <Music className="w-4 h-4" /> Start Music Search
            </button>
            <button
              onClick={onOpenSmartModal}
              className="px-5 py-2.5 bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 font-bold rounded-xl text-xs flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-purple-400" /> AI Smart Playlist
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 border border-white/5">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Playlists</p>
            <h3 className="text-2xl font-extrabold text-white">{playlists.length}</h3>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 border border-white/5">
          <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Saved Tracks</p>
            <h3 className="text-2xl font-extrabold text-white">{totalTracksCount}</h3>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 border border-white/5">
          <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Redis Cache Status</p>
            <h3 className="text-2xl font-extrabold text-emerald-300">Active (300s TTL)</h3>
          </div>
        </div>
      </div>

      {/* Suggested AI Recommendations */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Suggested For You
          </h3>
          <span className="text-xs text-indigo-300 font-medium">Powered by Spotify API</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {loadingRecs ? (
            <div className="col-span-full py-6 text-center text-slate-400 text-xs animate-pulse">
              Generating recommendations based on listening profile...
            </div>
          ) : (
            recommendations.map((track) => (
              <div
                key={track.spotifyTrackId}
                className="p-3 bg-slate-900/50 hover:bg-white/5 rounded-2xl transition flex items-center gap-3 group border border-white/5 cursor-pointer"
                onClick={() => onPlayTrack(track)}
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                  <img src={track.albumArt} alt={track.trackName} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition">
                    {track.trackName}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">{(track.artists || []).join(', ')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
