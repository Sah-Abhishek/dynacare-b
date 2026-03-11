const db = require('../config/db');

exports.getNotes = async (req, res) => {
    try {
        const notes = await db.query(`
      SELECT n.*, p.full_name as patient_name 
      FROM notes n 
      JOIN patients p ON n.patient_id = p.id 
      WHERE n.professional_id = $1 
      ORDER BY n.created_at DESC
    `, [req.user.id]);
        res.json(notes.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching notes' });
    }
};

exports.getNotesByPatientId = async (req, res) => {
    try {
        const notes = await db.query(`
      SELECT n.*, p.full_name as patient_name 
      FROM notes n 
      JOIN patients p ON n.patient_id = p.id 
      WHERE n.patient_id = $1 AND n.professional_id = $2
      ORDER BY n.created_at DESC
    `, [req.params.patientId, req.user.id]);
        res.json(notes.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching patient notes' });
    }
};

exports.getNoteById = async (req, res) => {
    try {
        const note = await db.query(`
      SELECT n.*, p.full_name as patient_name 
      FROM notes n 
      JOIN patients p ON n.patient_id = p.id 
      WHERE n.id = $1 AND n.professional_id = $2
    `, [req.params.id, req.user.id]);

        if (note.rows.length === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json(note.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching note details' });
    }
};

exports.createNote = async (req, res) => {
    const { patient_id, appointment_id, content, status, ai_insights } = req.body;
    try {
        const newNote = await db.query(
            'INSERT INTO notes (patient_id, professional_id, appointment_id, content, status, ai_insights) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [patient_id, req.user.id, appointment_id, content, status || 'Draft', ai_insights]
        );

        // Log Activity
        await db.query(
            'INSERT INTO activity_logs (user_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)',
            [req.user.id, `Created session note (${status || 'Draft'})`, 'Note', newNote.rows[0].id]
        );

        res.status(201).json(newNote.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating note' });
    }
};

exports.updateNote = async (req, res) => {
    const { content, status, ai_insights } = req.body;
    try {
        const updated = await db.query(
            'UPDATE notes SET content = $1, status = $2, ai_insights = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND professional_id = $5 RETURNING *',
            [content, status, ai_insights, req.params.id, req.user.id]
        );
        if (updated.rows.length === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating note' });
    }
};

// Templates
exports.getTemplates = async (req, res) => {
    try {
        const templates = await db.query(
            'SELECT * FROM note_templates WHERE professional_id IS NULL OR professional_id = $1 ORDER BY name ASC',
            [req.user.id]
        );
        res.json(templates.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching templates' });
    }
};

exports.createTemplate = async (req, res) => {
    const { name, category, content } = req.body;
    try {
        const newTemplate = await db.query(
            'INSERT INTO note_templates (professional_id, name, category, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.id, name, category, content]
        );
        res.status(201).json(newTemplate.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating template' });
    }
};
