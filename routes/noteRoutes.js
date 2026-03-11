const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', noteController.getNotes);
router.get('/templates', noteController.getTemplates);
router.get('/patient/:patientId', noteController.getNotesByPatientId);
router.get('/:id', noteController.getNoteById);
router.post('/', noteController.createNote);
router.put('/:id', noteController.updateNote);
router.post('/templates', noteController.createTemplate);

module.exports = router;
