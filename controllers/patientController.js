const db = require('../config/db');

exports.getPatients = async (req, res) => {
    console.log('GET /api/patients called at:', new Date().toISOString());
    try {
        const patients = await db.query('SELECT * FROM patients ORDER BY created_at DESC');
        console.log(`Found ${patients.rows.length} patients`);
        res.json(patients.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching patients' });
    }
};

exports.getPatientById = async (req, res) => {
    try {
        const patient = await db.query('SELECT * FROM patients WHERE id = $1', [req.params.id]);
        if (patient.rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(patient.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching patient details' });
    }
};

exports.createPatient = async (req, res) => {
    const { full_name, email, phone, dob, gender, address, insurance_provider, insurance_id } = req.body;

    // Validate required field
    if (!full_name || full_name.trim() === '') {
        return res.status(400).json({ message: 'Full name is required' });
    }

    try {
        // Convert empty strings to null for optional fields
        const patientData = [
            full_name.trim(),
            email?.trim() || null,
            phone?.trim() || null,
            dob || null,
            gender || null,
            address?.trim() || null,
            insurance_provider?.trim() || null,
            insurance_id?.trim() || null
        ];

        const newPatient = await db.query(
            'INSERT INTO patients (full_name, email, phone, dob, gender, address, insurance_provider, insurance_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            patientData
        );
        res.status(201).json(newPatient.rows[0]);
    } catch (err) {
        console.error('Error creating patient:', err.message);
        console.error('Stack:', err.stack);

        // Check for specific database errors
        if (err.code === '23505') {
            // Unique constraint violation (duplicate email)
            return res.status(400).json({ message: 'A patient with this email already exists' });
        }
        if (err.code === 'ECONNREFUSED') {
            return res.status(503).json({ message: 'Database connection failed. Please try again later.' });
        }

        res.status(500).json({ message: `Error creating patient: ${err.message}` });
    }
};

exports.updatePatient = async (req, res) => {
    const { full_name, email, phone, dob, gender, address, insurance_provider, insurance_id, status } = req.body;
    try {
        const updatedPatient = await db.query(
            'UPDATE patients SET full_name = $1, email = $2, phone = $3, dob = $4, gender = $5, address = $6, insurance_provider = $7, insurance_id = $8, status = $9 WHERE id = $10 RETURNING *',
            [full_name, email || null, phone || null, dob || null, gender || null, address || null, insurance_provider || null, insurance_id || null, status || 'Active', req.params.id]
        );
        if (updatedPatient.rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(updatedPatient.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating patient' });
    }
};
