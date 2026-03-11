const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes - no auth required (for demo/testing)
router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatientById);
router.post('/', patientController.createPatient);

// Protected routes - require authentication
router.put('/:id', authMiddleware, patientController.updatePatient);

module.exports = router;
