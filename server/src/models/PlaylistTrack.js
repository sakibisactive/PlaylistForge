const mongoose = require('mongoose');

const PlaylistTrackSchema = new mongoose.Schema({
  trackId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  playlistId: {
    type: String,
    required: true,
    index: true
  },
  spotifyTrackId: {
    type: String,
    required: true,
    index: true
  },
  trackName: {
    type: String,
    required: true
  },
  artists: {
    type: [String],
    default: []
  },
  albumName: {
    type: String,
    default: ''
  },
  albumArt: {
    type: String,
    default: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80'
  },
  durationMs: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

PlaylistTrackSchema.index({ playlistId: 1, order: 1 });
PlaylistTrackSchema.index({ spotifyTrackId: 1 });

module.exports = mongoose.model('PlaylistTrack', PlaylistTrackSchema);
