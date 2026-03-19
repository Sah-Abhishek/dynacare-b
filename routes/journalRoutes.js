const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', journalController.getMyJournals);
router.get('/all', journalController.getAllJournals);

module.exports = router;
