const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Admin login
exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const result = await db.query('SELECT * FROM admins WHERE email = $1', [email.trim().toLowerCase()]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const admin = result.rows[0];
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            admin: {
                id: admin.id,
                full_name: admin.full_name,
                email: admin.email,
            }
        });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Create admin credentials (only admins can create other admins)
exports.createAdmin = async (req, res) => {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'Full name, email, and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
        const existing = await db.query('SELECT id FROM admins WHERE email = $1', [cleanEmail]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'An admin with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = await db.query(
            `INSERT INTO admins (full_name, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, full_name, email, created_at`,
            [full_name, cleanEmail, hashedPassword]
        );

        res.status(201).json({
            message: 'Admin credentials created successfully',
            admin: newAdmin.rows[0]
        });
    } catch (err) {
        console.error('Error creating admin:', err);
        res.status(500).json({ message: 'Error creating admin credentials' });
    }
};

// Get all doctors (users)
exports.getAllDoctors = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, full_name, email, practice_name, specialization, license_number, phone_number, created_at
             FROM users ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching doctors:', err);
        res.status(500).json({ message: 'Error fetching doctors' });
    }
};

// Get all patients
exports.getAllPatients = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT p.*,
                    (SELECT u.full_name FROM users u
                     JOIN appointments a ON a.professional_id = u.id
                     WHERE a.patient_id = p.id
                     ORDER BY a.appointment_date DESC LIMIT 1
                    ) AS assigned_doctor
             FROM patients p
             ORDER BY p.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching patients:', err);
        res.status(500).json({ message: 'Error fetching patients' });
    }
};

// Get patient count per doctor
exports.getDoctorPatientCounts = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.id, u.full_name, u.specialization,
                    COUNT(DISTINCT a.patient_id) AS patient_count
             FROM users u
             LEFT JOIN appointments a ON a.professional_id = u.id
             GROUP BY u.id, u.full_name, u.specialization
             ORDER BY patient_count DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching doctor patient counts:', err);
        res.status(500).json({ message: 'Error fetching doctor patient counts' });
    }
};

// Create doctor credentials
exports.createDoctor = async (req, res) => {
    const { full_name, email, password, practice_name, specialization, license_number, phone_number } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'Full name, email, and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
        const existing = await db.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'A doctor with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newDoctor = await db.query(
            `INSERT INTO users (full_name, email, password, practice_name, specialization, license_number, phone_number)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, full_name, email, practice_name, specialization, license_number, phone_number, created_at`,
            [full_name, cleanEmail, hashedPassword, practice_name || null, specialization || null, license_number || null, phone_number || null]
        );

        res.status(201).json({
            message: 'Doctor credentials created successfully',
            doctor: newDoctor.rows[0]
        });
    } catch (err) {
        console.error('Error creating doctor:', err);
        res.status(500).json({ message: 'Error creating doctor credentials' });
    }
};

// Get all journals
exports.getAllJournals = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM journals ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching journals:', err);
        res.status(500).json({ message: 'Error fetching journals' });
    }
};

// Get all journal assignments (which user has access to which journal)
exports.getJournalAssignments = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT uj.id, uj.user_id, uj.journal_id, uj.created_at,
                    u.full_name AS user_name, u.email AS user_email,
                    j.name AS journal_name
             FROM user_journals uj
             JOIN users u ON u.id = uj.user_id
             JOIN journals j ON j.id = uj.journal_id
             ORDER BY u.full_name ASC, j.name ASC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching journal assignments:', err);
        res.status(500).json({ message: 'Error fetching journal assignments' });
    }
};

// Assign journal to a user
exports.assignJournal = async (req, res) => {
    const { user_id, journal_id } = req.body;

    if (!user_id || !journal_id) {
        return res.status(400).json({ message: 'User ID and Journal ID are required' });
    }

    try {
        const existing = await db.query(
            'SELECT id FROM user_journals WHERE user_id = $1 AND journal_id = $2',
            [user_id, journal_id]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'This user already has access to this journal' });
        }

        const result = await db.query(
            `INSERT INTO user_journals (user_id, journal_id)
             VALUES ($1, $2)
             RETURNING *`,
            [user_id, journal_id]
        );

        res.status(201).json({
            message: 'Journal access granted successfully',
            assignment: result.rows[0]
        });
    } catch (err) {
        console.error('Error assigning journal:', err);
        res.status(500).json({ message: 'Error assigning journal access' });
    }
};

// Revoke journal access from a user
exports.revokeJournal = async (req, res) => {
    const { user_id, journal_id } = req.body;

    if (!user_id || !journal_id) {
        return res.status(400).json({ message: 'User ID and Journal ID are required' });
    }

    try {
        const result = await db.query(
            'DELETE FROM user_journals WHERE user_id = $1 AND journal_id = $2 RETURNING *',
            [user_id, journal_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        res.json({ message: 'Journal access revoked successfully' });
    } catch (err) {
        console.error('Error revoking journal:', err);
        res.status(500).json({ message: 'Error revoking journal access' });
    }
};

// Update doctor password
exports.updateDoctorPassword = async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        const existing = await db.query('SELECT id FROM users WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error updating doctor password:', err);
        res.status(500).json({ message: 'Error updating password' });
    }
};

// Get admin dashboard stats
exports.getAdminStats = async (req, res) => {
    try {
        const [doctors, patients, appointments] = await Promise.all([
            db.query('SELECT COUNT(*) FROM users'),
            db.query('SELECT COUNT(*) FROM patients'),
            db.query('SELECT COUNT(*) FROM appointments'),
        ]);

        res.json({
            totalDoctors: parseInt(doctors.rows[0].count),
            totalPatients: parseInt(patients.rows[0].count),
            totalAppointments: parseInt(appointments.rows[0].count),
        });
    } catch (err) {
        console.error('Error fetching admin stats:', err);
        res.status(500).json({ message: 'Error fetching admin stats' });
    }
};
