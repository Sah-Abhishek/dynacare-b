const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const recordingController = require('../controllers/recordingController');
const authMiddleware = require('../middleware/authMiddleware');

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `audio_${Date.now()}_${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
            'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/mp4',
            'audio/m4a', 'audio/x-m4a', 'audio/aac', 'audio/flac'
        ];
        if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'), false);
        }
    }
});

// Public routes - no auth required
router.post('/upload', recordingController.createRecording);
router.post('/upload-file', upload.single('audio'), recordingController.uploadAudioFile);
router.post('/transcribe', upload.single('audio'), recordingController.transcribeAudioFile);
router.post('/clinical-summary', recordingController.generateClinicalSummary);

// Protected routes - require authentication
router.use(authMiddleware);
router.get('/', recordingController.getRecordings);
router.get('/:id', recordingController.getRecordingById);

module.exports = router;
