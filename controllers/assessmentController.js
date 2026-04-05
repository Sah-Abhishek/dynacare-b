const db = require('../config/db');
const crypto = require('crypto');

// Create a shareable assessment link token (protected - doctor creates)
exports.createToken = async (req, res) => {
    const { patient_id, assessment_type, session_id } = req.body;
    if (!patient_id || !assessment_type) {
        return res.status(400).json({ message: 'patient_id and assessment_type are required' });
    }
    try {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const result = await db.query(
            'INSERT INTO assessment_tokens (token, patient_id, professional_id, assessment_type, expires_at, session_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [token, patient_id, req.user.id, assessment_type, expiresAt, session_id || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating assessment token' });
    }
};

// Validate a token and return assessment info (public - no auth)
exports.validateToken = async (req, res) => {
    const { token } = req.params;
    try {
        const result = await db.query(
            `SELECT at.*, p.full_name as patient_name
             FROM assessment_tokens at
             JOIN patients p ON at.patient_id = p.id
             WHERE at.token = $1`,
            [token]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Invalid assessment link' });
        }
        const tokenData = result.rows[0];
        if (new Date(tokenData.expires_at) < new Date()) {
            return res.status(410).json({ message: 'This assessment link has expired' });
        }
        res.json({
            assessment_type: tokenData.assessment_type,
            patient_name: tokenData.patient_name,
            patient_id: tokenData.patient_id,
            expired: false
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error validating token' });
    }
};

// Submit assessment response (public - no auth, uses token)
exports.submitResponse = async (req, res) => {
    const { token } = req.params;
    const { answers, total_score, difficulty } = req.body;
    try {
        const tokenResult = await db.query(
            'SELECT * FROM assessment_tokens WHERE token = $1',
            [token]
        );
        if (tokenResult.rows.length === 0) {
            return res.status(404).json({ message: 'Invalid assessment link' });
        }
        const tokenData = tokenResult.rows[0];
        if (new Date(tokenData.expires_at) < new Date()) {
            return res.status(410).json({ message: 'This assessment link has expired' });
        }

        const response = await db.query(
            'INSERT INTO assessment_responses (patient_id, professional_id, assessment_type, answers, total_score, difficulty, token_id, session_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [tokenData.patient_id, tokenData.professional_id, tokenData.assessment_type, JSON.stringify(answers), total_score, difficulty || null, tokenData.id, tokenData.session_id || null]
        );

        res.status(201).json({ message: 'Assessment submitted successfully', response: response.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error submitting assessment' });
    }
};

// Get assessment responses for a patient (protected - doctor views)
exports.getResponsesByPatient = async (req, res) => {
    const { patientId } = req.params;
    const { type } = req.query;
    try {
        let query = 'SELECT * FROM assessment_responses WHERE patient_id = $1';
        const params = [patientId];
        if (type) {
            query += ' AND assessment_type = $2';
            params.push(type);
        }
        query += ' ORDER BY created_at DESC';
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching assessment responses' });
    }
};
