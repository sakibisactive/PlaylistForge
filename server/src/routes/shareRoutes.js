const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:playlistId/share', protect, shareController.sharePlaylist);
router.get('/shared/:shareId', shareController.getSharedPlaylist);

module.exports = router;
