const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/transcribe', aiController.transcribe);
router.post('/analyze', aiController.analyzeSession);
router.post('/analyze-session', aiController.analyzeSession);
router.get('/diagnostic-suggestions', aiController.getDiagnosticSuggestions);
router.post('/symptom-report', aiController.getSymptomsReport);
router.post('/summarize', aiController.summarizeSession);
router.post('/dsm-insight', aiController.getDsmInsight);
router.post('/generate-report', aiController.generateReport);
router.post('/note-assistant', aiController.noteAssistant);

module.exports = router;
