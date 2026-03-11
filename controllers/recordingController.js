const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');
const { generateMockClinicalSummary } = require('../utils/clinicalSummaryGenerator');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


exports.getRecordings = async (req, res) => {
    try {
        const recordings = await db.query(`
      SELECT r.*, p.full_name as patient_name 
      FROM recordings r 
      JOIN patients p ON r.patient_id = p.id 
      WHERE r.professional_id = $1 
      ORDER BY r.created_at DESC
    `, [req.user.id]);
        res.json(recordings.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching recordings' });
    }
};

exports.createRecording = async (req, res) => {
    const { patient_id, appointment_id, audio_url, transcript, summary, duration, file_size, format } = req.body;

    // Validate required fields
    if (!patient_id || !audio_url) {
        return res.status(400).json({ message: 'patient_id and audio_url are required' });
    }

    try {
        // Use authenticated user ID or default to 1 if not authenticated
        const professional_id = req.user?.id || 1;

        // Convert duration from "MM:SS" format to seconds (integer)
        let durationInSeconds = null;
        if (duration) {
            if (typeof duration === 'string' && duration.includes(':')) {
                const [mins, secs] = duration.split(':').map(Number);
                durationInSeconds = (mins * 60) + secs;
            } else if (typeof duration === 'number') {
                durationInSeconds = duration;
            }
        }

        // Convert file_size from "X.X MB" string to bytes (bigint)
        let fileSizeInBytes = null;
        if (file_size) {
            if (typeof file_size === 'string') {
                // Parse "0.5 MB" -> 0.5 * 1024 * 1024 bytes
                const match = file_size.match(/([\d.]+)\s*(MB|KB|GB)?/i);
                if (match) {
                    const value = parseFloat(match[1]);
                    const unit = (match[2] || 'MB').toUpperCase();
                    const multipliers = { 'KB': 1024, 'MB': 1024 * 1024, 'GB': 1024 * 1024 * 1024 };
                    fileSizeInBytes = Math.floor(value * (multipliers[unit] || 1));
                }
            } else if (typeof file_size === 'number') {
                fileSizeInBytes = file_size;
            }
        }

        const newRecording = await db.query(
            'INSERT INTO recordings (patient_id, professional_id, appointment_id, audio_url, transcript, summary, duration, file_size, format) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [
                patient_id,
                professional_id,
                appointment_id || null,
                audio_url,
                transcript || null,
                summary || null,
                durationInSeconds,
                fileSizeInBytes,
                format || 'wav'
            ]
        );

        // Log Activity (skip if no auth)
        if (req.user?.id) {
            await db.query(
                'INSERT INTO activity_logs (user_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)',
                [req.user.id, 'Uploaded new session recording', 'Recording', newRecording.rows[0].id]
            );
        }

        res.status(201).json(newRecording.rows[0]);
    } catch (err) {
        console.error('Error creating recording:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).json({ message: `Error creating recording: ${err.message}` });
    }
};

exports.getRecordingById = async (req, res) => {
    try {
        const recording = await db.query(`
      SELECT r.*, p.full_name as patient_name 
      FROM recordings r 
      JOIN patients p ON r.patient_id = p.id 
      WHERE r.id = $1 AND r.professional_id = $2
    `, [req.params.id, req.user.id]);

        if (recording.rows.length === 0) {
            return res.status(404).json({ message: 'Recording not found' });
        }
        res.json(recording.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching recording details' });
    }
};

// Upload audio file and create recording
exports.uploadAudioFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No audio file uploaded' });
    }

    const { patient_id, duration, type, notes } = req.body;

    if (!patient_id) {
        return res.status(400).json({ message: 'patient_id is required' });
    }

    try {
        const professional_id = req.user?.id || 1;
        const audio_url = `/uploads/${req.file.filename}`;
        const fileSizeInBytes = req.file.size;
        const format = path.extname(req.file.originalname).replace('.', '') || 'audio';

        // Parse duration if provided
        let durationInSeconds = null;
        if (duration) {
            if (typeof duration === 'string' && duration.includes(':')) {
                const [mins, secs] = duration.split(':').map(Number);
                durationInSeconds = (mins * 60) + (secs || 0);
            } else {
                durationInSeconds = parseInt(duration) || null;
            }
        }

        const newRecording = await db.query(
            'INSERT INTO recordings (patient_id, professional_id, audio_url, transcript, summary, duration, file_size, format) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [
                patient_id,
                professional_id,
                audio_url,
                notes || null,
                null,
                durationInSeconds,
                fileSizeInBytes,
                format
            ]
        );

        if (req.user?.id) {
            await db.query(
                'INSERT INTO activity_logs (user_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)',
                [req.user.id, 'Uploaded audio file', 'Recording', newRecording.rows[0].id]
            );
        }

        res.status(201).json(newRecording.rows[0]);
    } catch (err) {
        console.error('Error uploading audio file:', err.message);
        res.status(500).json({ message: `Error uploading audio file: ${err.message}` });
    }
};

// Generate AI Clinical Summary from transcript
exports.generateClinicalSummary = async (req, res) => {
    const { transcript, patient_id, duration } = req.body;

    if (!transcript || transcript.trim() === '') {
        return res.status(400).json({
            message: 'Transcript is required',
            summary: null
        });
    }

    try {
        console.log('Generating clinical summary for transcript...');

        // Use mock generator (in production, this would call OpenAI/Claude API)
        const summary = generateMockClinicalSummary(transcript);

        // Add session metadata
        summary.sessionMetadata = {
            patientId: patient_id,
            duration: duration || 'N/A',
            transcriptLength: transcript.length,
            wordCount: transcript.split(/\s+/).length,
        };

        console.log('Clinical summary generated successfully');

        res.status(200).json({
            success: true,
            summary: summary,
            message: 'Clinical summary generated successfully'
        });
    } catch (err) {
        console.error('Error generating clinical summary:', err.message);
        res.status(500).json({
            message: `Error generating clinical summary: ${err.message}`,
            summary: null
        });
    }
};

// Transcribe uploaded audio file using OpenAI Whisper
exports.transcribeAudioFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No audio file provided' });
    }

    try {
        const filePath = req.file.path;
        console.log('Transcribing audio file:', filePath);

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: 'whisper-1',
            language: 'en',
        });

        console.log('Transcription completed, length:', transcription.text.length);

        res.status(200).json({
            success: true,
            transcript: transcription.text,
        });
    } catch (err) {
        console.error('Error transcribing audio:', err.message);
        res.status(500).json({
            success: false,
            message: `Error transcribing audio: ${err.message}`,
        });
    }
};
