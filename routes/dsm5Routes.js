const express = require('express');
const router = express.Router();
const dsm5Controller = require('../controllers/dsm5Controller');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/disorders', dsm5Controller.getDisorders);
router.get('/ai-search', dsm5Controller.searchAI);
router.get('/disorders/:code', dsm5Controller.getDisorderByCode);
router.get('/bookmarks', dsm5Controller.getBookmarks);
router.post('/bookmarks', dsm5Controller.toggleBookmark);

module.exports = router;
