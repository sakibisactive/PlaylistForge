const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
  playlistId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=500&q=80'
  }
}, { timestamps: true });

PlaylistSchema.index({ createdBy: 1 });
PlaylistSchema.index({ playlistId: 1 });

module.exports = mongoose.model('Playlist', PlaylistSchema);
