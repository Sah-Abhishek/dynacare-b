const express = require('express');
const router = express.Router();
const clinicalController = require('../controllers/clinicalController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/history/:patientId', clinicalController.getMedicalHistory);
router.post('/history/:patientId', clinicalController.addMedicalHistory);
router.put('/history/:historyId', clinicalController.updateMedicalHistory);
router.delete('/history/:historyId', clinicalController.deleteMedicalHistory);

router.get('/medications/:patientId', clinicalController.getMedications);
router.post('/medications/:patientId', clinicalController.addMedication);
router.put('/medications/:id', clinicalController.updateMedication);
router.delete('/medications/:id', clinicalController.deleteMedication);

router.get('/diagnoses/:patientId', clinicalController.getDiagnoses);
router.post('/diagnoses/:patientId', clinicalController.addDiagnosis);
router.put('/diagnoses/:id', clinicalController.updateDiagnosis);
router.delete('/diagnoses/:id', clinicalController.deleteDiagnosis);

router.get('/treatment-plans/:patientId', clinicalController.getTreatmentPlans);
router.post('/treatment-plans/:patientId', clinicalController.addTreatmentPlan);
router.put('/treatment-plans/:id', clinicalController.updateTreatmentPlan);
router.delete('/treatment-plans/:id', clinicalController.deleteTreatmentPlan);

router.get('/templates', clinicalController.getTemplates);
router.get('/metrics', clinicalController.getMetrics);

module.exports = router;
