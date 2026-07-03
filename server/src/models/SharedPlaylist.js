const mongoose = require('mongoose');

const SharedPlaylistSchema = new mongoose.Schema({
  shareId: {
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
  sharedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  permission: {
    type: String,
    enum: ['view', 'edit'],
    default: 'view'
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

SharedPlaylistSchema.index({ shareId: 1 });
SharedPlaylistSchema.index({ playlistId: 1 });

module.exports = mongoose.model('SharedPlaylist', SharedPlaylistSchema);
