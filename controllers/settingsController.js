const db = require('../config/db');

exports.getSettings = async (req, res) => {
    try {
        const settings = await db.query('SELECT * FROM user_settings WHERE user_id = $1', [req.user.id]);

        if (settings.rows.length === 0) {
            // Create default settings if they don't exist
            const newSettings = await db.query(
                'INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *',
                [req.user.id]
            );
            return res.json(newSettings.rows[0]);
        }

        res.json(settings.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching settings' });
    }
};

exports.updateSettings = async (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    if (fields.length === 0) {
        return res.status(400).json({ message: 'No fields provided to update' });
    }

    try {
        // First, ensure user_settings row exists for this user
        const existingSettings = await db.query('SELECT * FROM user_settings WHERE user_id = $1', [req.user.id]);

        if (existingSettings.rows.length === 0) {
            // Create default settings first
            await db.query('INSERT INTO user_settings (user_id) VALUES ($1)', [req.user.id]);
        }

        // Filter out fields that don't exist in the table
        const validFields = ['recording_enabled', 'audio_quality', 'auto_transcribe', 'transcription_lang',
            'ai_whisper_configured', 'dsm5_detection', 'detection_sensitivity',
            'data_retention_days', 'require_consent', 'email_alerts', 'app_reminders', 'diagnostic_insights'];

        const filteredFields = fields.filter(f => validFields.includes(f));
        const filteredValues = filteredFields.map(f => req.body[f]);

        if (filteredFields.length === 0) {
            // If no valid fields, just return current settings
            const settings = await db.query('SELECT * FROM user_settings WHERE user_id = $1', [req.user.id]);
            return res.json(settings.rows[0]);
        }

        const setClause = filteredFields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        const query = `
      UPDATE user_settings 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = $${filteredFields.length + 1} 
      RETURNING *
    `;

        const updated = await db.query(query, [...filteredValues, req.user.id]);
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating settings' });
    }
};

exports.exportSettings = async (req, res) => {
    try {
        const settings = await db.query('SELECT * FROM user_settings WHERE user_id = $1', [req.user.id]);
        const userInfo = await db.query('SELECT id, full_name, email, practice_name, specialization FROM users WHERE id = $1', [req.user.id]);

        res.json({
            exported_at: new Date().toISOString(),
            user: userInfo.rows[0],
            settings: settings.rows[0] || {
                recording_enabled: true,
                audio_quality: 'Standard (128 kbps)',
                auto_transcribe: true,
                transcription_lang: 'English'
            },
            export_version: '1.0'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error exporting settings' });
    }
};
