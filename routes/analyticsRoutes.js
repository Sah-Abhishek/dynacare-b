const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/stats', authMiddleware, analyticsController.getStats);

module.exports = router;
