const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const logger = require('./utils/logger');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const shareRoutes = require('./routes/shareRoutes');
const adminRoutes = require('./routes/adminRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express();

// Middlewares
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', limiter);

// Swagger Documentation UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'PlaylistForge API', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api', shareRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Database manual seed trigger endpoint
app.post('/api/seed', async (req, res) => {
  try {
    const { MOCK_TRACKS } = require('./services/spotifyService');
    const User = require('./models/User');
    const Playlist = require('./models/Playlist');
    const PlaylistTrack = require('./models/PlaylistTrack');
    const bcrypt = require('bcryptjs');

    // Create demo user if not exists
    let demoUser = await User.findOne({ username: 'sakib_creator' });
    if (!demoUser) {
      demoUser = await User.create({
        username: 'sakib_creator',
        email: 'sakib@playlistforge.com',
        passwordHash: await bcrypt.hash('password123', 10)
      });
    }

    // Create starter playlist
    let starter = await Playlist.findOne({ playlistId: 'pl_starter_demo' });
    if (!starter) {
      starter = await Playlist.create({
        playlistId: 'pl_starter_demo',
        name: '🔥 PlaylistForge Starter Mix',
        description: 'Popular featured tracks to kickstart your playlist experience.',
        createdBy: demoUser._id,
        isPublic: true
      });

      const trackDocs = MOCK_TRACKS.slice(0, 6).map((t, idx) => ({
        trackId: `tr_starter_${idx}`,
        playlistId: starter.playlistId,
        spotifyTrackId: t.spotifyTrackId,
        trackName: t.trackName,
        artists: t.artists,
        albumName: t.albumName,
        albumArt: t.albumArt,
        durationMs: t.durationMs,
        order: idx,
        addedBy: demoUser._id
      }));

      await PlaylistTrack.insertMany(trackDocs);
    }

    res.json({ message: 'Database populated successfully with starter tracks!', playlistId: starter.playlistId });
  } catch (err) {
    logger.error('API Seed error:', err.message);
    res.status(500).json({ message: 'Error seeding database', error: err.message });
  }
});

// Global 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

module.exports = app;
