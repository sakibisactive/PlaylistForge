import React from 'react';

export function SkeletonLoader({ count = 4, type = 'track' }) {
  return (
    <div className="space-y-3 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-panel p-3 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-700/50 rounded-lg"></div>
            <div className="space-y-2">
              <div className="w-36 h-4 bg-slate-700/50 rounded"></div>
              <div className="w-24 h-3 bg-slate-800/50 rounded"></div>
            </div>
          </div>
          <div className="w-16 h-4 bg-slate-700/50 rounded hidden md:block"></div>
        </div>
      ))}
    </div>
  );
}
