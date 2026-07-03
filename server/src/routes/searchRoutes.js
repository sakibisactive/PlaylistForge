const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', searchController.searchTracks);

module.exports = router;
