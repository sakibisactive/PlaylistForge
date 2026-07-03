const spotifyService = require('../services/spotifyService');
const { getCache, setCache } = require('../services/redisService');
const logger = require('../utils/logger');

// @desc    Search tracks, artists, and albums with 300s Redis cache
// @route   GET /api/search
exports.searchTracks = async (req, res) => {
  try {
    const query = req.query.q || req.query.query || 'top hits';
    const cacheKey = `search:${query.toLowerCase().trim()}`;

    // 1. Check Redis / In-Memory Cache first
    const cachedResults = await getCache(cacheKey);
    if (cachedResults) {
      return res.json({
        cached: true,
        query,
        count: cachedResults.length,
        tracks: cachedResults
      });
    }

    // 2. Fetch from Spotify API or Mock Service
    const tracks = await spotifyService.searchTracks(query);

    // 3. Store in Redis Cache with 300 seconds (5 min) TTL
    await setCache(cacheKey, 300, tracks);

    logger.info(`Search executed for query: "${query}" (Cache Miss)`);

    res.json({
      cached: false,
      query,
      count: tracks.length,
      tracks
    });
  } catch (error) {
    logger.error('Search error:', error.message);
    res.status(500).json({ message: 'Error searching tracks' });
  }
};
