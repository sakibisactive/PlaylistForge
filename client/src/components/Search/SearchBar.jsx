import React from 'react';
import { Search, Zap, Filter, X } from 'lucide-react';

export default function SearchBar({ searchTerm, setSearchTerm, filter, setFilter, cached }) {
  return (
    <div className="glass-panel p-4 rounded-2xl mb-6 space-y-3">
      {/* Search Input Box */}
      <div className="relative">
        <Search className="w-5 h-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search songs, artists, albums with instant 300ms debouncing..."
          className="w-full glass-input pl-11 pr-24 py-3 rounded-xl text-sm font-medium"
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-white rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {cached && (
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 animate-pulse" /> REDIS CACHED
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium mr-2">
          <Filter className="w-3.5 h-3.5" /> Filter by:
        </span>
        {['all', 'track', 'artist', 'album'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
              filter === f
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
