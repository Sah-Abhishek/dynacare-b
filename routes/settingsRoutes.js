const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', settingsController.getSettings);
router.patch('/', settingsController.updateSettings);
router.post('/export', settingsController.exportSettings);

module.exports = router;
