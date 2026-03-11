const express = require('express');
const router = express.Router();
const clinicalController = require('../controllers/clinicalController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/history/:patientId', clinicalController.getMedicalHistory);
router.post('/history/:patientId', clinicalController.addMedicalHistory);

router.get('/medications/:patientId', clinicalController.getMedications);
router.post('/medications/:patientId', clinicalController.addMedication);

router.get('/diagnoses/:patientId', clinicalController.getDiagnoses);

router.get('/treatment-plans/:patientId', clinicalController.getTreatmentPlans);

router.get('/templates', clinicalController.getTemplates);
router.get('/metrics', clinicalController.getMetrics);

module.exports = router;
