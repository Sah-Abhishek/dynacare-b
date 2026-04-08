const express = require('express');
const router = express.Router();
const multer = require('multer');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// Memory storage so the buffer goes straight to S3
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max for a PDF
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname || '')) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
});

// Public download endpoint — accepts token via ?token= so anchor tags work.
// Auth is handled inside the controller for this route.
router.get('/:id/download', reportController.downloadReport);

// All other routes require a header-based auth token
router.use(authMiddleware);
router.post('/', upload.single('file'), reportController.saveReport);
router.get('/', reportController.listReports);
router.delete('/:id', reportController.deleteReport);

module.exports = router;
