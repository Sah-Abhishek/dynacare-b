const db = require('../config/db');
const path = require('path');
const { Readable } = require('stream');
const { OpenAI } = require('openai');
// Mock generator removed — now using real OpenAI API
const { uploadToS3 } = require('../config/s3');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


exports.getRecordings = async (req, res) => {
    try {
        const { patientId } = req.query;
        let query = `
      SELECT r.*, p.full_name as patient_name
      FROM recordings r
      JOIN patients p ON r.patient_id = p.id
      WHERE r.professional_id = $1`;
        const params = [req.user.id];

        if (patientId) {
            params.push(patientId);
            query += ` AND r.patient_id = $2`;
        }

        query += ` ORDER BY r.created_at DESC`;

        const recordings = await db.query(query, params);
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

// Upload audio file to S3 and create recording
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
        const format = path.extname(req.file.originalname).replace('.', '') || 'audio';
        const filename = `audio_${Date.now()}_${Math.round(Math.random() * 1e6)}.${format}`;
        const s3Key = `dynacare/audio/${filename}`;

        // Upload to S3
        const audio_url = await uploadToS3(req.file.buffer, s3Key, req.file.mimetype);
        const fileSizeInBytes = req.file.size;

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
        console.log('Generating DSM-5 and Harrison reports via OpenAI...');

        const dsm5Prompt = `You are a licensed clinical psychologist. Analyze the following therapy session transcript and produce a structured clinical summary using DSM-5 (Diagnostic and Statistical Manual of Mental Disorders, 5th Edition) as your reference framework.

Return a JSON object with exactly this structure:
{
  "overview": {
    "primaryConcerns": ["list of main concerns identified from the transcript"],
    "mood": "patient's mood as observed (e.g. Anxious, Low, Stable, Elevated)",
    "moodScore": number from 1-10 based on transcript content,
    "affect": "observed affect (e.g. Constricted, Flat, Appropriate, Labile)",
    "engagement": "level of engagement (e.g. Good, Fair, Poor, Guarded)"
  },
  "symptoms": {
    "reported": ["list of symptoms mentioned or observed in transcript"],
    "severity": "overall severity (Mild, Moderate, Severe)",
    "duration": "duration if mentioned, otherwise 'Not specified'"
  },
  "riskAssessment": {
    "level": "Low, Moderate, or High",
    "color": "green, yellow, or red",
    "suicidalIdeation": boolean,
    "homicidalIdeation": boolean,
    "concerns": ["specific risk concerns from transcript"]
  },
  "clinicalImpression": {
    "possibleDiagnoses": [
      {
        "code": "DSM-5/ICD-10 code",
        "name": "disorder name",
        "confidence": "Low, Moderate, or High",
        "evidence": "specific evidence from transcript supporting this"
      }
    ],
    "functionalImpairment": "Mild, Moderate, or Severe"
  },
  "clinicalInsights": {
    "themes": ["key therapeutic themes identified"],
    "behavioralObservations": "observations about patient behavior during session"
  },
  "treatmentPlan": {
    "recommendations": ["specific treatment recommendations"],
    "followUp": "recommended follow-up timeframe",
    "referrals": ["any referrals needed"]
  },
  "nextSteps": ["actionable next steps"]
}

Base everything strictly on the transcript content. Do not invent symptoms or concerns not supported by the text. If something cannot be determined from the transcript, say so.`;

        const harrisonPrompt = `You are a senior physician and internist. Analyze the following clinical session transcript using Harrison's Principles of Internal Medicine as your reference framework. Focus on identifying potential medical/physical conditions, systemic diseases, and somatic symptoms that may underlie or accompany the patient's complaints.

Return a JSON object with exactly this structure:
{
  "overview": {
    "primaryConcerns": ["list of main medical concerns identified from the transcript"],
    "systemsInvolved": ["list of organ systems potentially involved, e.g. Cardiovascular, Endocrine, Neurological"],
    "vitalSignConcerns": "any vital sign or physical concerns noted or implied"
  },
  "medicalFindings": {
    "reportedSymptoms": ["list of medically relevant symptoms from the transcript"],
    "possibleConditions": [
      {
        "condition": "medical condition name (e.g. Hypothyroidism, Anemia, Hypertension)",
        "icdCode": "ICD-10 code if applicable",
        "confidence": "Low, Moderate, or High",
        "evidence": "specific evidence from transcript supporting this",
        "harrisonReference": "relevant Harrison's chapter or section reference"
      }
    ],
    "differentialDiagnosis": ["other conditions to rule out"]
  },
  "labRecommendations": {
    "suggestedTests": [
      {
        "test": "lab test or investigation name",
        "reason": "why this test is recommended based on the transcript"
      }
    ]
  },
  "medicationConsiderations": {
    "currentMedications": ["any medications mentioned in the transcript"],
    "potentialInteractions": "any drug interaction concerns",
    "recommendations": ["medication-related recommendations"]
  },
  "treatmentPlan": {
    "recommendations": ["specific medical treatment recommendations"],
    "followUp": "recommended follow-up timeframe",
    "referrals": ["specialist referrals needed, e.g. Endocrinologist, Cardiologist"]
  },
  "nextSteps": ["actionable medical next steps"]
}

Base everything strictly on the transcript content. Do not invent symptoms or conditions not supported by the text. If something cannot be determined from the transcript, say so. Focus on the medical/physical health perspective, not psychiatric diagnoses.`;

        // Generate both reports in parallel
        const [dsm5Response, harrisonResponse] = await Promise.all([
            openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: dsm5Prompt },
                    { role: "user", content: `Session transcript:\n\n${transcript}` }
                ],
                response_format: { type: "json_object" }
            }),
            openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: harrisonPrompt },
                    { role: "user", content: `Session transcript:\n\n${transcript}` }
                ],
                response_format: { type: "json_object" }
            })
        ]);

        const dsm5Summary = JSON.parse(dsm5Response.choices[0].message.content);
        const harrisonSummary = JSON.parse(harrisonResponse.choices[0].message.content);

        const metadata = {
            generatedAt: new Date().toISOString(),
            sessionMetadata: {
                patientId: patient_id,
                duration: duration || 'N/A',
                transcriptLength: transcript.length,
                wordCount: transcript.split(/\s+/).length,
            }
        };

        dsm5Summary.generatedAt = metadata.generatedAt;
        dsm5Summary.sessionMetadata = metadata.sessionMetadata;
        harrisonSummary.generatedAt = metadata.generatedAt;
        harrisonSummary.sessionMetadata = metadata.sessionMetadata;

        console.log('Both DSM-5 and Harrison reports generated successfully');

        res.status(200).json({
            success: true,
            summary: dsm5Summary,
            harrisonSummary: harrisonSummary,
            message: 'Clinical summaries generated successfully'
        });
    } catch (err) {
        console.error('Error generating clinical summary:', err.message);
        res.status(500).json({
            message: `Error generating clinical summary: ${err.message}`,
            summary: null
        });
    }
};

// Update recording with transcript and summary
exports.updateRecording = async (req, res) => {
    const { id } = req.params;
    const { transcript, summary } = req.body;

    try {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (transcript !== undefined) {
            fields.push(`transcript = $${paramIndex++}`);
            values.push(transcript);
        }
        if (summary !== undefined) {
            fields.push(`summary = $${paramIndex++}`);
            values.push(typeof summary === 'string' ? summary : JSON.stringify(summary));
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(id);
        values.push(req.user?.id || 1);

        const result = await db.query(
            `UPDATE recordings SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND professional_id = $${paramIndex} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Recording not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating recording:', err.message);
        res.status(500).json({ message: `Error updating recording: ${err.message}` });
    }
};

// Transcribe uploaded audio file using OpenAI Whisper
exports.transcribeAudioFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No audio file provided' });
    }

    try {
        console.log('Transcribing audio file from buffer, size:', req.file.size);

        // Create a File object from the buffer for OpenAI SDK
        const file = new File([req.file.buffer], req.file.originalname, {
            type: req.file.mimetype,
        });

        const transcription = await openai.audio.transcriptions.create({
            file: file,
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
