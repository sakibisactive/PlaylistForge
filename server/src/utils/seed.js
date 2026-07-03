const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Playlist = require('../models/Playlist');
const PlaylistTrack = require('../models/PlaylistTrack');
const { MOCK_TRACKS } = require('../services/spotifyService');

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not set in environment!');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Clear existing data for fresh seeding
    await User.deleteMany({});
    await Playlist.deleteMany({});
    await PlaylistTrack.deleteMany({});

    console.log('Cleared existing database collections.');

    // Create Demo Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const demoUser = await User.create({
      username: 'sakib_creator',
      email: 'sakib@playlistforge.com',
      passwordHash
    });

    const adminUser = await User.create({
      username: 'instructor_admin',
      email: 'admin@playlistforge.com',
      passwordHash
    });

    console.log('Created demo users: sakib_creator, instructor_admin');

    // Create Featured Playlists
    const playlist1 = await Playlist.create({
      playlistId: 'pl_featured_01',
      name: '🔥 Top Global Hits 2026',
      description: 'The hottest tracks trending globally on Spotify and PlaylistForge.',
      createdBy: demoUser._id,
      isPublic: true,
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'
    });

    const playlist2 = await Playlist.create({
      playlistId: 'pl_chill_vibes_02',
      name: '🌙 Chill & Synthwave Beats',
      description: 'Smooth, relaxing tracks for coding and late night sessions.',
      createdBy: demoUser._id,
      isPublic: true,
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'
    });

    // Populate Tracks
    const tracksToInsert = MOCK_TRACKS.map((t, idx) => ({
      trackId: `tr_seed_${idx + 1}`,
      playlistId: idx < 4 ? playlist1.playlistId : playlist2.playlistId,
      spotifyTrackId: t.spotifyTrackId,
      trackName: t.trackName,
      artists: t.artists,
      albumName: t.albumName,
      albumArt: t.albumArt,
      durationMs: t.durationMs,
      order: idx % 4,
      addedBy: demoUser._id
    }));

    await PlaylistTrack.insertMany(tracksToInsert);
    console.log(`Successfully seeded ${tracksToInsert.length} tracks across 2 playlists!`);

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
