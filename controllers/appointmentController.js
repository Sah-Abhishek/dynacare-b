const db = require('../config/db');

exports.getAppointments = async (req, res) => {
    try {
        const appointments = await db.query(`
      SELECT a.*, p.full_name as patient_name 
      FROM appointments a 
      JOIN patients p ON a.patient_id = p.id 
      WHERE a.professional_id = $1 
      ORDER BY a.appointment_date ASC
    `, [req.user.id]);
        res.json(appointments.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching appointments' });
    }
};

exports.createAppointment = async (req, res) => {
    const { patient_id, appointment_date, duration, type, notes } = req.body;
    try {
        const newAppointment = await db.query(
            'INSERT INTO appointments (patient_id, professional_id, appointment_date, duration, type, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [patient_id, req.user.id, appointment_date, duration, type, notes]
        );

        // Log Activity
        await db.query(
            'INSERT INTO activity_logs (user_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)',
            [req.user.id, 'Scheduled new appointment', 'Appointment', newAppointment.rows[0].id]
        );

        res.status(201).json(newAppointment.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating appointment' });
    }
};

exports.updateAppointment = async (req, res) => {
    const { appointment_date, duration, type, status, notes } = req.body;
    try {
        const updated = await db.query(
            'UPDATE appointments SET appointment_date = $1, duration = $2, type = $3, status = $4, notes = $5 WHERE id = $6 AND professional_id = $7 RETURNING *',
            [appointment_date, duration, type, status, notes, req.params.id, req.user.id]
        );
        if (updated.rows.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating appointment' });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        const deleted = await db.query(
            'DELETE FROM appointments WHERE id = $1 AND professional_id = $2 RETURNING *',
            [req.params.id, req.user.id]
        );
        if (deleted.rows.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json({ message: 'Appointment cancelled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting appointment' });
    }
};

exports.getTodayAppointments = async (req, res) => {
    try {
        const today = await db.query(`
            SELECT a.*, p.full_name as patient_name 
            FROM appointments a 
            JOIN patients p ON a.patient_id = p.id 
            WHERE a.appointment_date::date = CURRENT_DATE
            ORDER BY a.appointment_date ASC
        `, []);

        // Format for frontend (split date and time)
        const formatted = today.rows.map(appt => {
            const dateObj = new Date(appt.appointment_date);
            return {
                ...appt,
                appointment_date: dateObj.toISOString().split('T')[0],
                appointment_time: dateObj.toTimeString().split(' ')[0].substring(0, 5) // HH:mm
            };
        });

        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching today appointments' });
    }
};

exports.getAppointmentStats = async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                COUNT(*) FILTER (WHERE appointment_date::date = CURRENT_DATE) as today,
                COUNT(*) FILTER (WHERE appointment_date >= date_trunc('week', CURRENT_TIMESTAMP)) as week,
                COUNT(*) FILTER (WHERE appointment_date >= date_trunc('month', CURRENT_TIMESTAMP)) as month,
                COUNT(*) FILTER (WHERE status = 'Scheduled') as pending
            FROM appointments
        `, []);

        const row = stats.rows[0];
        res.json({
            today: parseInt(row.today),
            week: parseInt(row.week),
            month: parseInt(row.month),
            pending: parseInt(row.pending)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching appointment stats' });
    }
};
