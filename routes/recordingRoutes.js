const express = require('express');
const router = express.Router();
const multer = require('multer');
const recordingController = require('../controllers/recordingController');
const authMiddleware = require('../middleware/authMiddleware');

// Use memory storage so files go to S3, not local disk
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
            'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/mp4',
            'audio/m4a', 'audio/x-m4a', 'audio/aac', 'audio/flac',
            'video/mp4', 'audio/x-m4a', 'application/octet-stream'
        ];
        if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'), false);
        }
    }
});

// Stream endpoint — accepts token via query param (for <audio> elements and direct downloads)
router.get('/:id/stream', recordingController.streamAudio);

// All other routes require authentication via header
router.use(authMiddleware);
router.post('/upload', recordingController.createRecording);
router.post('/upload-file', upload.single('audio'), recordingController.uploadAudioFile);
router.post('/transcribe', upload.single('audio'), recordingController.transcribeAudioFile);
router.post('/clinical-summary', recordingController.generateClinicalSummary);
router.get('/', recordingController.getRecordings);
router.get('/:id', recordingController.getRecordingById);
router.patch('/:id', recordingController.updateRecording);

module.exports = router;
