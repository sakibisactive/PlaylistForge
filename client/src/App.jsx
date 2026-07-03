import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { fetchCurrentUser, setToken } from './store/slices/authSlice';
import AuthModal from './components/Auth/AuthModal';
import Navbar from './components/Common/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import SearchBar from './components/Search/SearchBar';
import SearchResults from './components/Search/SearchResults';
import PlaylistManager from './components/Playlist/PlaylistManager';
import PlaylistViewer from './components/Playlist/PlaylistViewer';
import PlaylistPlayer from './components/Player/PlaylistPlayer';
import ShareModal from './components/Share/ShareModal';
import SmartPlaylistModal from './components/Dashboard/SmartPlaylistModal';
import ImportModal from './components/Dashboard/ImportModal';
import AdminDashboard from './components/Admin/AdminDashboard';
import SharedPlaylistView from './components/Share/SharedPlaylistView';
import ErrorBoundary from './components/Common/ErrorBoundary';
import { useSearch } from './hooks/useSearch';
import { usePlaylist } from './hooks/usePlaylist';
import { usePlayer } from './hooks/usePlayer';

function MainApp() {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [shareTargetPlaylist, setShareTargetPlaylist] = useState(null);
  const [showSmartModal, setShowSmartModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Custom hooks
  const { searchTerm, setSearchTerm, results, loading: searchLoading, cached, filter, setFilter } = useSearch('');
  const {
    playlists,
    currentPlaylist,
    tracks,
    loading: playlistsLoading,
    tracksLoading,
    loadUserPlaylists,
    loadTracks,
    handleCreatePlaylist,
    handleAddTrack,
    handleRemoveTrack
  } = usePlaylist();
  
  const { currentTrack, isPlaying, volume, startPlayback, togglePlayback, changeVolume } = usePlayer();

  // Check URL query for Spotify OAuth callback token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      dispatch(setToken(tokenParam));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [dispatch]);

  // Load current user profile & playlists on mount
  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
      loadUserPlaylists();
    }
  }, [token, dispatch]);

  // Load tracks when current playlist changes
  useEffect(() => {
    if (currentPlaylist) {
      loadTracks(currentPlaylist.playlistId);
    }
  }, [currentPlaylist]);

  // If user is not authenticated, 1st page must be Login & Registration!
  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen flex flex-col pb-24 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAdmin={() => setShowAdminModal(true)}
      />

      <main className="max-w-7xl mx-auto px-4 py-2 w-full flex-1">
        {activeTab === 'dashboard' && (
          <Dashboard
            playlists={playlists}
            onSelectPlaylist={(pl) => {
              setActiveTab('playlists');
            }}
            onPlayTrack={startPlayback}
            onOpenSmartModal={() => setShowSmartModal(true)}
            onOpenImportModal={() => setShowImportModal(true)}
            onSwitchToSearch={() => setActiveTab('search')}
          />
        )}

        {activeTab === 'search' && (
          <div className="space-y-6">
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filter={filter}
              setFilter={setFilter}
              cached={cached}
            />
            <SearchResults
              results={results}
              loading={searchLoading}
              playlists={playlists}
              onAddTrack={handleAddTrack}
              onPlayTrack={startPlayback}
            />
          </div>
        )}

        {activeTab === 'playlists' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4">
              <PlaylistManager
                playlists={playlists}
                currentPlaylist={currentPlaylist}
                onSelectPlaylist={(pl) => {
                  loadTracks(pl.playlistId);
                }}
                onCreatePlaylist={handleCreatePlaylist}
                onOpenSmartModal={() => setShowSmartModal(true)}
                onOpenImportModal={() => setShowImportModal(true)}
              />
            </div>
            <div className="lg:col-span-8">
              <PlaylistViewer
                playlist={currentPlaylist}
                tracks={tracks}
                loading={tracksLoading}
                onRemoveTrack={handleRemoveTrack}
                onReorderTracks={() => loadTracks(currentPlaylist.playlistId)}
                onPlayTrack={startPlayback}
                onOpenShareModal={(pl) => setShareTargetPlaylist(pl)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Audio Player Bar */}
      <PlaylistPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={togglePlayback}
        volume={volume}
        onChangeVolume={changeVolume}
      />

      {/* Dialog Modals */}
      {shareTargetPlaylist && (
        <ShareModal playlist={shareTargetPlaylist} onClose={() => setShareTargetPlaylist(null)} />
      )}

      {showSmartModal && (
        <SmartPlaylistModal
          onClose={() => setShowSmartModal(false)}
          onSuccess={() => { loadUserPlaylists(); setActiveTab('playlists'); }}
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => { loadUserPlaylists(); setActiveTab('playlists'); }}
        />
      )}

      {showAdminModal && (
        <AdminDashboard onClose={() => setShowAdminModal(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/shared/:shareId" element={<SharedPlaylistView />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
