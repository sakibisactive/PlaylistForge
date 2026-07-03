import React from 'react';
import TrackItem from './TrackItem';
import { SkeletonLoader } from '../Common/SkeletonLoader';
import { Music2 } from 'lucide-react';

export default function SearchResults({ results, loading, playlists, onAddTrack, onPlayTrack }) {
  if (loading) {
    return <SkeletonLoader count={5} />;
  }

  if (!results || results.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center text-slate-400">
        <Music2 className="w-12 h-12 mx-auto mb-3 opacity-40 text-indigo-400" />
        <p className="text-sm font-medium">No tracks found. Try searching for "The Weeknd", "Harry Styles", or "Bohemian".</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((track) => (
        <TrackItem
          key={track.spotifyTrackId || track.trackId}
          track={track}
          playlists={playlists}
          onAddTrack={onAddTrack}
          onPlayTrack={onPlayTrack}
        />
      ))}
    </div>
  );
}
