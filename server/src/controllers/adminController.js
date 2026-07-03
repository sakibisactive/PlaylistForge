const User = require('../models/User');
const Playlist = require('../models/Playlist');
const PlaylistTrack = require('../models/PlaylistTrack');
const { getCacheStats } = require('../services/redisService');
const spotifyService = require('../services/spotifyService');
const { broadcastSystemMessage } = require('../services/socketService');

// @desc    Get Admin System Analytics
// @route   GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPlaylists = await Playlist.countDocuments();
    const totalTracks = await PlaylistTrack.countDocuments();

    // Most added tracks aggregation
    const topTracks = await PlaylistTrack.aggregate([
      { $group: { _id: '$spotifyTrackId', trackName: { $first: '$trackName' }, artists: { $first: '$artists' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const avgPlaylistSize = totalPlaylists > 0 ? (totalTracks / totalPlaylists).toFixed(1) : 0;
    const cacheStats = getCacheStats();
    const spotifyStats = spotifyService.getApiStats();

    res.json({
      metrics: {
        totalUsers,
        totalPlaylists,
        totalTracks,
        avgPlaylistSize
      },
      topTracks,
      cacheStats,
      spotifyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error loading admin analytics' });
  }
};

// @desc    Instructor Manual Override System
// @route   POST /api/admin/override
exports.manualOverride = async (req, res) => {
  try {
    const { action, username, broadcastMessage } = req.body;

    if (action === 'RESET_SPOTIFY_TOKEN') {
      const user = await User.findOne({ username });
      if (!user) return res.status(404).json({ message: 'User not found' });
      user.spotifyAccessToken = null;
      user.spotifyRefreshToken = null;
      await user.save();
      return res.json({ message: `Reset Spotify tokens for ${username}` });
    }

    if (action === 'BROADCAST_MESSAGE') {
      broadcastSystemMessage(broadcastMessage || 'System announcement from Admin');
      return res.json({ message: 'System message broadcasted to all active clients' });
    }

    if (action === 'VIEW_USER_PLAYLISTS') {
      const user = await User.findOne({ username });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const playlists = await Playlist.find({ createdBy: user._id });
      return res.json({ username, playlists });
    }

    res.status(400).json({ message: 'Invalid override action specified' });
  } catch (error) {
    res.status(500).json({ message: 'Error executing admin override' });
  }
};

// @desc    Export Playlist Data as CSV
// @route   GET /api/admin/export
exports.exportCSV = async (req, res) => {
  try {
    const tracks = await PlaylistTrack.find().populate('playlistId').populate('addedBy', 'username');

    let csv = 'PlaylistID,TrackID,SpotifyTrackID,TrackName,Artists,AlbumName,DurationMs,AddedByUsername,AddedAt\n';

    tracks.forEach((t) => {
      const artistsStr = (t.artists || []).join('; ').replace(/"/g, '""');
      const trackNameStr = (t.trackName || '').replace(/"/g, '""');
      const albumStr = (t.albumName || '').replace(/"/g, '""');
      const username = t.addedBy ? t.addedBy.username : 'Unknown';

      csv += `"${t.playlistId}","${t.trackId}","${t.spotifyTrackId}","${trackNameStr}","${artistsStr}","${albumStr}",${t.durationMs},"${username}","${t.addedAt}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="playlistforge_data_export.csv"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting CSV' });
  }
};
