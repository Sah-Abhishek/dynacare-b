const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', sessionController.createSession);
router.get('/:id', sessionController.getSessionById);
router.get('/patient/:patientId', sessionController.getSessionsByPatient);
router.patch('/:id', sessionController.updateSession);

module.exports = router;
