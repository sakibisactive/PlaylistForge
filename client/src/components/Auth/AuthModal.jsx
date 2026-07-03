import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, clearError } from '../../store/slices/authSlice';
import { useSpotifyAuth } from '../../hooks/useSpotifyAuth';
import { Music, Music2, Sparkles, LogIn, UserPlus, ShieldAlert } from 'lucide-react';

export default function AuthModal() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const { connectSpotify, connecting } = useSpotifyAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      dispatch(registerUser(formData));
    } else {
      dispatch(loginUser({ emailOrUsername: formData.username || formData.email, password: formData.password }));
    }
  };

  const handleDemoLogin = () => {
    dispatch(loginUser({ emailOrUsername: 'sakib_creator', password: 'password123' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="glass-panel p-8 rounded-3xl max-w-md w-full shadow-2xl relative z-10 border border-white/10">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl mb-3 shadow-lg shadow-indigo-500/30">
            <Music className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent">
            PlaylistForge
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Craft, Sync & Share Your Music Playlists
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => { setIsRegister(false); dispatch(clearError()); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
              !isRegister ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); dispatch(clearError()); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
              isRegister ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {isRegister ? 'Username' : 'Username or Email'}
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder={isRegister ? 'e.g. sakib_creator' : 'Enter username or email'}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 text-sm mt-2"
          >
            {loading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" /> Create PlaylistForge Account
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700/60"></div></div>
          <span className="relative bg-slate-900/90 px-3 text-xs text-slate-400">or connect with</span>
        </div>

        {/* Spotify OAuth Button */}
        <button
          type="button"
          onClick={connectSpotify}
          disabled={connecting}
          className="w-full py-2.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm mb-3"
        >
          <Music2 className="w-5 h-5 text-black" />
          {connecting ? 'Connecting to Spotify...' : 'Connect to Spotify'}
        </button>

        {/* 1-Click Demo Login Helper */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2 bg-slate-800/80 hover:bg-slate-700 text-indigo-300 font-medium rounded-xl border border-indigo-500/30 transition flex items-center justify-center gap-2 text-xs"
        >
          <Sparkles className="w-3.5 h-3.5" /> 1-Click Instructor / Demo Sign In
        </button>
      </div>
    </div>
  );
}
