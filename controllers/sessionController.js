const db = require('../config/db');

exports.createSession = async (req, res) => {
    const { patient_id, appointment_id } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO sessions (patient_id, professional_id, appointment_id) VALUES ($1, $2, $3) RETURNING *',
            [patient_id, req.user.id, appointment_id || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating session' });
    }
};

exports.getSessionById = async (req, res) => {
    try {
        // Get session
        const sessionRes = await db.query(
            `SELECT s.*, p.full_name as patient_name FROM sessions s JOIN patients p ON s.patient_id = p.id WHERE s.id = $1 AND s.professional_id = $2`,
            [req.params.id, req.user.id]
        );
        if (sessionRes.rows.length === 0) return res.status(404).json({ message: 'Session not found' });

        const session = sessionRes.rows[0];

        // Get linked data in parallel
        const [recRes, noteRes, assessRes] = await Promise.all([
            db.query('SELECT * FROM recordings WHERE session_id = $1', [session.id]),
            db.query('SELECT * FROM notes WHERE session_id = $1', [session.id]),
            db.query('SELECT * FROM assessment_responses WHERE session_id = $1 ORDER BY created_at DESC', [session.id]),
        ]);

        session.recording = recRes.rows[0] || null;
        session.note = noteRes.rows[0] || null;
        session.assessments = assessRes.rows;

        res.json(session);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching session' });
    }
};

exports.getSessionsByPatient = async (req, res) => {
    try {
        const sessionsRes = await db.query(
            `SELECT s.*, p.full_name as patient_name FROM sessions s JOIN patients p ON s.patient_id = p.id WHERE s.patient_id = $1 AND s.professional_id = $2 ORDER BY s.created_at DESC`,
            [req.params.patientId, req.user.id]
        );

        const sessions = sessionsRes.rows;
        if (sessions.length === 0) return res.json([]);

        const sessionIds = sessions.map(s => s.id);

        // Batch fetch all linked data
        const [recs, notes, assessments] = await Promise.all([
            db.query('SELECT * FROM recordings WHERE session_id = ANY($1)', [sessionIds]),
            db.query('SELECT * FROM notes WHERE session_id = ANY($1)', [sessionIds]),
            db.query('SELECT * FROM assessment_responses WHERE session_id = ANY($1) ORDER BY created_at DESC', [sessionIds]),
        ]);

        // Map to sessions
        sessions.forEach(s => {
            s.recording = recs.rows.find(r => r.session_id === s.id) || null;
            s.note = notes.rows.find(n => n.session_id === s.id) || null;
            s.assessments = assessments.rows.filter(a => a.session_id === s.id);
        });

        res.json(sessions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching sessions' });
    }
};

exports.updateSession = async (req, res) => {
    const { status } = req.body;
    try {
        const result = await db.query(
            'UPDATE sessions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND professional_id = $3 RETURNING *',
            [status, req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Session not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating session' });
    }
};
