const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  spotifyId: {
    type: String,
    default: null
  },
  spotifyAccessToken: {
    type: String,
    default: null
  },
  spotifyRefreshToken: {
    type: String,
    default: null
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });

module.exports = mongoose.model('User', UserSchema);
