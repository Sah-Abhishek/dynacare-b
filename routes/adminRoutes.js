const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Public - admin login
router.post('/login', adminController.adminLogin);

// Protected - require admin token
router.get('/doctors', adminAuthMiddleware, adminController.getAllDoctors);
router.get('/patients', adminAuthMiddleware, adminController.getAllPatients);
router.get('/doctor-patient-counts', adminAuthMiddleware, adminController.getDoctorPatientCounts);
router.get('/stats', adminAuthMiddleware, adminController.getAdminStats);
router.post('/create-doctor', adminAuthMiddleware, adminController.createDoctor);
router.post('/create-admin', adminAuthMiddleware, adminController.createAdmin);
router.patch('/doctor/:id/password', adminAuthMiddleware, adminController.updateDoctorPassword);
router.get('/journals', adminAuthMiddleware, adminController.getAllJournals);
router.get('/journal-assignments', adminAuthMiddleware, adminController.getJournalAssignments);
router.post('/assign-journal', adminAuthMiddleware, adminController.assignJournal);
router.post('/revoke-journal', adminAuthMiddleware, adminController.revokeJournal);

module.exports = router;
