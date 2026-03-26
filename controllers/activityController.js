const db = require('../config/db');

exports.getActivityLogs = async (req, res) => {
    try {
        const logs = await db.query(`
      SELECT al.*,
        CASE
          WHEN al.target_type = 'Patient' THEN al.target_id
          WHEN al.target_type = 'Appointment' THEN a.patient_id
          WHEN al.target_type = 'Recording' THEN r.patient_id
          WHEN al.target_type = 'Note' THEN n.patient_id
        END AS patient_id,
        COALESCE(
          CASE WHEN al.target_type = 'Patient' THEN p_direct.full_name END,
          CASE WHEN al.target_type = 'Appointment' THEN p_appt.full_name END,
          CASE WHEN al.target_type = 'Recording' THEN p_rec.full_name END,
          CASE WHEN al.target_type = 'Note' THEN p_note.full_name END
        ) AS patient_name
      FROM activity_logs al
      LEFT JOIN appointments a ON al.target_type = 'Appointment' AND al.target_id = a.id
      LEFT JOIN recordings r ON al.target_type = 'Recording' AND al.target_id = r.id
      LEFT JOIN notes n ON al.target_type = 'Note' AND al.target_id = n.id
      LEFT JOIN patients p_direct ON al.target_type = 'Patient' AND al.target_id = p_direct.id
      LEFT JOIN patients p_appt ON al.target_type = 'Appointment' AND a.patient_id = p_appt.id
      LEFT JOIN patients p_rec ON al.target_type = 'Recording' AND r.patient_id = p_rec.id
      LEFT JOIN patients p_note ON al.target_type = 'Note' AND n.patient_id = p_note.id
      WHERE al.user_id = $1
      ORDER BY al.timestamp DESC
      LIMIT 10
    `, [req.user.id]);
        res.json(logs.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching activity logs' });
    }
};
