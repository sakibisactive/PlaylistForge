import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Share2, Copy, Check, Users, Shield, Clock, X } from 'lucide-react';

export default function ShareModal({ playlist, onClose }) {
  const [targetUsername, setTargetUsername] = useState('');
  const [permission, setPermission] = useState('view');
  const [copied, setCopied] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateShare = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axiosClient.post(`/playlists/${playlist.playlistId}/share`, {
        targetUsername: targetUsername || null,
        permission,
        expiresInHours: 72
      });
      setShareData(res.data);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to share playlist');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareData?.shareUrl) return;
    navigator.clipboard.writeText(shareData.shareUrl);
    setCopied(true);
    toast.success('Share link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-white/10 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-indigo-600/30 text-indigo-300 rounded-2xl border border-indigo-500/30">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Share Playlist</h3>
            <p className="text-xs text-slate-400">"{playlist.name}"</p>
          </div>
        </div>

        <form onSubmit={handleGenerateShare} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Share with Specific Username (Optional)
            </label>
            <input
              type="text"
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
              placeholder="Leave blank for public shareable link"
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Permission Level</label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm bg-slate-900"
            >
              <option value="view">Can View (Read Only)</option>
              <option value="edit">Can Edit (Add & Remove Tracks)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition text-xs"
          >
            {loading ? 'Generating Link...' : 'Generate Shareable Link'}
          </button>
        </form>

        {shareData && (
          <div className="mt-6 p-4 bg-slate-900/80 rounded-2xl border border-indigo-500/30 space-y-3">
            <p className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Share Link Active:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareData.shareUrl}
                className="w-full glass-input px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300"
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Link expires in 72 hours
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
