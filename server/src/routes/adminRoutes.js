const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/adminMiddleware');

router.get('/analytics', protectAdmin, adminController.getAnalytics);
router.post('/override', protectAdmin, adminController.manualOverride);
router.get('/export', protectAdmin, adminController.exportCSV);

module.exports = router;
