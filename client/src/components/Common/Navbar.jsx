import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { Music, LayoutDashboard, Search, Library, ShieldCheck, LogOut, Radio } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAdmin }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <nav className="sticky top-0 z-40 glass-panel border-b border-white/10 px-4 py-3 mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-md shadow-indigo-500/20">
            <Music className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
            PlaylistForge
          </span>
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
              activeTab === 'dashboard' ? 'bg-indigo-600/80 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden md:inline">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
              activeTab === 'search' ? 'bg-indigo-600/80 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="hidden md:inline">Search</span>
          </button>

          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
              activeTab === 'playlists' ? 'bg-indigo-600/80 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Library className="w-4 h-4" />
            <span className="hidden md:inline">Playlists</span>
          </button>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAdmin}
            className="p-2 bg-slate-800/80 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl transition text-xs font-semibold flex items-center gap-1.5"
            title="Instructor Admin Dashboard"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden lg:inline">Admin</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-700/60">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs uppercase shadow-inner">
              {user?.username ? user.username.substring(0, 2) : 'PF'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-white leading-tight">{user?.username || 'User'}</p>
              <p className="text-[10px] text-indigo-300 leading-none">Logged In</p>
            </div>
          </div>

          <button
            onClick={() => dispatch(logout())}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
