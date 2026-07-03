const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, playlistController.createPlaylist);
router.get('/', protect, playlistController.getUserPlaylists);
router.post('/import', protect, playlistController.importSpotifyPlaylist);
router.post('/smart', protect, playlistController.createSmartPlaylist);

router.get('/:playlistId', playlistController.getPlaylistById);
router.get('/:playlistId/tracks', playlistController.getPlaylistTracks);
router.post('/:playlistId/tracks', protect, playlistController.addTrackToPlaylist);
router.delete('/:playlistId/tracks/:trackId', protect, playlistController.removeTrackFromPlaylist);
router.put('/:playlistId/reorder', protect, playlistController.reorderPlaylistTracks);

module.exports = router;
