const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no auth - patient takes test via link)
router.get('/public/:token', assessmentController.validateToken);
router.post('/public/:token/submit', assessmentController.submitResponse);

// Protected routes (doctor creates token, views results)
router.post('/token', authMiddleware, assessmentController.createToken);
router.get('/responses/:patientId', authMiddleware, assessmentController.getResponsesByPatient);

module.exports = router;
