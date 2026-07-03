const express = require('express');
const router = express.Router();
const recommendationsController = require('../controllers/recommendationsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, recommendationsController.getRecommendations);

module.exports = router;
