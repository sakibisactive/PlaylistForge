const SharedPlaylist = require('../models/SharedPlaylist');
const Playlist = require('../models/Playlist');
const PlaylistTrack = require('../models/PlaylistTrack');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// @desc    Generate share link or share playlist with specific username
// @route   POST /api/playlists/:playlistId/share
exports.sharePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { targetUsername, permission = 'view', expiresInHours } = req.body;

    const playlist = await Playlist.findOne({ playlistId });
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    let sharedWithUser = null;
    if (targetUsername) {
      sharedWithUser = await User.findOne({ username: targetUsername });
      if (!sharedWithUser) {
        return res.status(404).json({ message: `User "${targetUsername}" not found` });
      }
    }

    const shareId = `sh_${uuidv4().substring(0, 12)}`;
    let expiresAt = null;
    if (expiresInHours) {
      expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    }

    const shareRecord = await SharedPlaylist.create({
      shareId,
      playlistId,
      sharedBy: req.user._id,
      sharedWith: sharedWithUser ? sharedWithUser._id : null,
      permission,
      expiresAt
    });

    const shareUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/shared/${shareId}`;

    res.status(201).json({
      message: 'Share link created successfully',
      shareId,
      shareUrl,
      permission,
      sharedWith: targetUsername || 'Public Link'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sharing playlist' });
  }
};

// @desc    Get shared playlist contents via shareId
// @route   GET /api/shared/:shareId
exports.getSharedPlaylist = async (req, res) => {
  try {
    const { shareId } = req.params;
    const share = await SharedPlaylist.findOne({ shareId })
      .populate('sharedBy', 'username email');

    if (!share) {
      return res.status(404).json({ message: 'Shared playlist link invalid or expired' });
    }

    if (share.expiresAt && new Date() > share.expiresAt) {
      return res.status(410).json({ message: 'This shared playlist link has expired' });
    }

    const playlist = await Playlist.findOne({ playlistId: share.playlistId });
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist no longer exists' });
    }

    const tracks = await PlaylistTrack.find({ playlistId: share.playlistId }).sort({ order: 1 });

    res.json({
      shareId,
      permission: share.permission,
      sharedBy: share.sharedBy.username,
      playlist,
      tracks
    });
  } catch (error) {
    res.status(500).json({ message: 'Error loading shared playlist' });
  }
};
