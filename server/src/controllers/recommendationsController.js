const PlaylistTrack = require('../models/PlaylistTrack');
const Playlist = require('../models/Playlist');
const spotifyService = require('../services/spotifyService');

// @desc    AI Recommendation Engine based on user playlist history
// @route   GET /api/recommendations
exports.getRecommendations = async (req, res) => {
  try {
    // Fetch user's existing tracks
    const playlists = await Playlist.find({ createdBy: req.user._id }).select('playlistId');
    const playlistIds = playlists.map(p => p.playlistId);

    const userTracks = await PlaylistTrack.find({ playlistId: { $in: playlistIds } }).limit(10);
    
    // Pick artist or track keyword from user history
    let seedQuery = 'synthwave pop';
    if (userTracks.length > 0) {
      const sample = userTracks[Math.floor(Math.random() * userTracks.length)];
      if (sample.artists && sample.artists.length > 0) {
        seedQuery = sample.artists[0];
      } else if (sample.trackName) {
        seedQuery = sample.trackName;
      }
    }

    const recommendations = await spotifyService.searchTracks(seedQuery);

    res.json({
      seedQuery,
      recommendations: recommendations.slice(0, 6)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching AI recommendations' });
  }
};
