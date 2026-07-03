const Playlist = require('../models/Playlist');
const PlaylistTrack = require('../models/PlaylistTrack');
const { v4: uuidv4 } = require('uuid');
const { getCache, setCache, invalidatePlaylistCache, invalidateSearchCache } = require('../services/redisService');
const spotifyService = require('../services/spotifyService');
const { notifyPlaylistUpdated } = require('../services/socketService');
const logger = require('../utils/logger');

// @desc    Create new playlist
// @route   POST /api/playlists
exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic, coverImage } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Playlist name is required' });
    }

    const playlistId = `pl_${uuidv4().substring(0, 12)}`;
    const playlist = await Playlist.create({
      playlistId,
      name,
      description: description || '',
      createdBy: req.user._id,
      isPublic: isPublic === true || isPublic === 'true',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=500&q=80'
    });

    await invalidateSearchCache();
    logger.info(`Playlist created: "${name}" (${playlistId}) by User: ${req.user.username}`);

    res.status(201).json({ playlist });
  } catch (error) {
    logger.error('Create playlist error:', error.message);
    res.status(500).json({ message: 'Error creating playlist' });
  }
};

// @desc    Get all playlists owned by authenticated user (paginated)
// @route   GET /api/playlists
exports.getUserPlaylists = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const total = await Playlist.countDocuments({ createdBy: req.user._id });
    const playlists = await Playlist.find({ createdBy: req.user._id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username email');

    // Attach track counts to each playlist
    const playlistsWithCounts = await Promise.all(playlists.map(async (pl) => {
      const trackCount = await PlaylistTrack.countDocuments({ playlistId: pl.playlistId });
      return {
        ...pl.toObject(),
        trackCount
      };
    }));

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      playlists: playlistsWithCounts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playlists' });
  }
};

// @desc    Get single playlist by ID (cached with 30s TTL)
// @route   GET /api/playlists/:playlistId
exports.getPlaylistById = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const cacheKey = `playlist:${playlistId}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ cached: true, playlist: cached });
    }

    const playlist = await Playlist.findOne({ playlistId }).populate('createdBy', 'username email');
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const trackCount = await PlaylistTrack.countDocuments({ playlistId });
    const fullData = { ...playlist.toObject(), trackCount };

    await setCache(cacheKey, 30, fullData);

    res.json({ cached: false, playlist: fullData });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playlist details' });
  }
};

// @desc    Get tracks in a specific playlist
// @route   GET /api/playlists/:playlistId/tracks
exports.getPlaylistTracks = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { sortBy = 'order', order = 'asc', search } = req.query;

    let query = { playlistId };
    if (search) {
      query.trackName = { $regex: search, $options: 'i' };
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    let sortObj = {};
    sortObj[sortBy] = sortOrder;

    const tracks = await PlaylistTrack.find(query)
      .sort(sortObj)
      .populate('addedBy', 'username');

    res.json({
      playlistId,
      count: tracks.length,
      tracks
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playlist tracks' });
  }
};

// @desc    Add track to playlist
// @route   POST /api/playlists/:playlistId/tracks
exports.addTrackToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { spotifyTrackId, trackName, artists, albumName, albumArt, durationMs } = req.body;

    if (!spotifyTrackId || !trackName) {
      return res.status(400).json({ message: 'Track details (spotifyTrackId, trackName) required' });
    }

    const playlist = await Playlist.findOne({ playlistId });
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Determine highest order index
    const lastTrack = await PlaylistTrack.findOne({ playlistId }).sort({ order: -1 });
    const nextOrder = lastTrack ? lastTrack.order + 1 : 0;

    const trackId = `tr_${uuidv4().substring(0, 12)}`;
    const newTrack = await PlaylistTrack.create({
      trackId,
      playlistId,
      spotifyTrackId,
      trackName,
      artists: Array.isArray(artists) ? artists : [artists || 'Unknown Artist'],
      albumName: albumName || 'Unknown Album',
      albumArt: albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80',
      durationMs: durationMs || 180000,
      order: nextOrder,
      addedBy: req.user._id
    });

    playlist.updatedAt = new Date();
    await playlist.save();

    // Cache Invalidation
    await invalidatePlaylistCache(playlistId);

    // Socket.io Real-time Event
    notifyPlaylistUpdated(playlistId, 'TRACK_ADDED', newTrack);

    res.status(201).json({ message: 'Track added successfully', track: newTrack });
  } catch (error) {
    logger.error('Add track error:', error.message);
    res.status(500).json({ message: 'Error adding track to playlist' });
  }
};

// @desc    Remove track from playlist
// @route   DELETE /api/playlists/:playlistId/tracks/:trackId
exports.removeTrackFromPlaylist = async (req, res) => {
  try {
    const { playlistId, trackId } = req.params;

    const track = await PlaylistTrack.findOneAndDelete({ playlistId, trackId });
    if (!track) {
      return res.status(404).json({ message: 'Track not found in playlist' });
    }

    await invalidatePlaylistCache(playlistId);
    notifyPlaylistUpdated(playlistId, 'TRACK_REMOVED', { trackId });

    res.json({ message: 'Track removed from playlist', trackId });
  } catch (error) {
    res.status(500).json({ message: 'Error removing track' });
  }
};

// @desc    Reorder tracks in playlist
// @route   PUT /api/playlists/:playlistId/reorder
exports.reorderPlaylistTracks = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { trackIds } = req.body; // Array of trackId in desired order

    if (!Array.isArray(trackIds)) {
      return res.status(400).json({ message: 'trackIds array is required' });
    }

    const bulkOps = trackIds.map((trId, index) => ({
      updateOne: {
        filter: { playlistId, trackId: trId },
        update: { $set: { order: index } }
      }
    }));

    await PlaylistTrack.bulkWrite(bulkOps);
    await invalidatePlaylistCache(playlistId);

    notifyPlaylistUpdated(playlistId, 'TRACKS_REORDERED', { trackIds });

    res.json({ message: 'Tracks reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error reordering tracks' });
  }
};

// @desc    Import Playlist from Spotify URL/URI
// @route   POST /api/playlists/import
exports.importSpotifyPlaylist = async (req, res) => {
  try {
    const { spotifyUrl } = req.body;
    if (!spotifyUrl) {
      return res.status(400).json({ message: 'Spotify playlist URL is required' });
    }

    // Extract playlist ID from URL
    const match = spotifyUrl.match(/playlist\/([a-zA-Z0-9]+)/);
    const spotifyPlaylistId = match ? match[1] : spotifyUrl;

    const spotifyData = await spotifyService.getSpotifyPlaylistTracks(spotifyPlaylistId);

    const playlistId = `pl_${uuidv4().substring(0, 12)}`;
    const newPlaylist = await Playlist.create({
      playlistId,
      name: spotifyData.name || 'Imported Spotify Playlist',
      description: spotifyData.description || 'Imported from Spotify URL',
      createdBy: req.user._id,
      isPublic: false
    });

    const trackDocs = spotifyData.tracks.map((t, idx) => ({
      trackId: `tr_${uuidv4().substring(0, 12)}`,
      playlistId,
      spotifyTrackId: t.spotifyTrackId,
      trackName: t.trackName,
      artists: t.artists,
      albumName: t.albumName,
      albumArt: t.albumArt,
      durationMs: t.durationMs,
      order: idx,
      addedBy: req.user._id
    }));

    await PlaylistTrack.insertMany(trackDocs);
    await invalidateSearchCache();

    res.status(201).json({
      message: 'Playlist imported successfully',
      playlist: newPlaylist,
      trackCount: trackDocs.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error importing Spotify playlist' });
  }
};

// @desc    Create Smart Playlist based on criteria
// @route   POST /api/playlists/smart
exports.createSmartPlaylist = async (req, res) => {
  try {
    const { name, energy, danceability, valence, limit } = req.body;

    const tracks = await spotifyService.generateSmartPlaylist({
      energy: parseFloat(energy || 0.5),
      danceability: parseFloat(danceability || 0.5),
      valence: parseFloat(valence || 0.5),
      limit: parseInt(limit || 8, 10)
    });

    const playlistId = `pl_${uuidv4().substring(0, 12)}`;
    const newPlaylist = await Playlist.create({
      playlistId,
      name: name || `Smart Mix (${energy > 0.7 ? 'High Energy' : 'Chill'})`,
      description: `AI Smart Playlist (Energy: ${energy}, Danceability: ${danceability}, Valence: ${valence})`,
      createdBy: req.user._id,
      isPublic: true
    });

    const trackDocs = tracks.map((t, idx) => ({
      trackId: `tr_${uuidv4().substring(0, 12)}`,
      playlistId,
      spotifyTrackId: t.spotifyTrackId,
      trackName: t.trackName,
      artists: t.artists,
      albumName: t.albumName,
      albumArt: t.albumArt,
      durationMs: t.durationMs,
      order: idx,
      addedBy: req.user._id
    }));

    await PlaylistTrack.insertMany(trackDocs);
    await invalidateSearchCache();

    res.status(201).json({
      message: 'Smart playlist generated successfully',
      playlist: newPlaylist,
      tracks: trackDocs
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating Smart Playlist' });
  }
};
