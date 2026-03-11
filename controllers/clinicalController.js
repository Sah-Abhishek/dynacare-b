const db = require('../config/db');

exports.getMedicalHistory = async (req, res) => {
    try {
        const history = await db.query('SELECT * FROM medical_history WHERE patient_id = $1', [req.params.patientId]);
        res.json(history.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching medical history' });
    }
};

exports.getMedications = async (req, res) => {
    try {
        const medications = await db.query('SELECT * FROM medications WHERE patient_id = $1', [req.params.patientId]);
        res.json(medications.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching medications' });
    }
};

exports.getDiagnoses = async (req, res) => {
    try {
        const diagnoses = await db.query('SELECT * FROM diagnoses WHERE patient_id = $1', [req.params.patientId]);
        res.json(diagnoses.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching diagnoses' });
    }
};

exports.getTreatmentPlans = async (req, res) => {
    try {
        const plans = await db.query('SELECT * FROM treatment_plans WHERE patient_id = $1', [req.params.patientId]);
        res.json(plans.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching treatment plans' });
    }
};

// Add create methods for these if needed for "Edit Profile" functionality
exports.addMedicalHistory = async (req, res) => {
    const { type, name, detail } = req.body;
    try {
        const newItem = await db.query(
            'INSERT INTO medical_history (patient_id, type, name, detail) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.params.patientId, type, name, detail]
        );
        res.status(201).json(newItem.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding medical history item' });
    }
};

exports.addMedication = async (req, res) => {
    const { name, dosage, frequency, status, prescribed_by, start_date, notes } = req.body;
    try {
        const newMed = await db.query(
            'INSERT INTO medications (patient_id, name, dosage, frequency, status, prescribed_by, start_date, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [req.params.patientId, name, dosage, frequency, status, prescribed_by, start_date, notes]
        );
        res.status(201).json(newMed.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding medication' });
    }
};

exports.getTemplates = async (req, res) => {
    try {
        // Return clinical note templates
        res.json({
            templates: [
                {
                    id: 1,
                    name: "Initial Psychiatric Evaluation",
                    category: "Assessment",
                    sections: ["Chief Complaint", "History of Present Illness", "Mental Status Exam", "Assessment & Plan"]
                },
                {
                    id: 2,
                    name: "Follow-up Progress Note",
                    category: "Progress",
                    sections: ["Interval History", "Current Medications", "Mental Status", "Treatment Response", "Plan"]
                },
                {
                    id: 3,
                    name: "Medication Management",
                    category: "Medication",
                    sections: ["Current Medications", "Side Effects", "Efficacy", "Adjustments", "Monitoring Plan"]
                },
                {
                    id: 4,
                    name: "Crisis Intervention",
                    category: "Crisis",
                    sections: ["Presenting Crisis", "Risk Assessment", "Safety Plan", "Immediate Interventions", "Follow-up"]
                }
            ]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching clinical templates' });
    }
};

exports.getMetrics = async (req, res) => {
    try {
        // Return clinical metrics/analytics
        res.json({
            metrics: {
                total_patients: 24,
                active_patients: 18,
                sessions_this_month: 45,
                avg_session_duration: 52,
                treatment_adherence_rate: 87,
                recovery_rate: 72,
                common_diagnoses: [
                    { code: "F32.1", name: "Major Depressive Disorder", count: 8 },
                    { code: "F41.1", name: "Generalized Anxiety Disorder", count: 6 },
                    { code: "F43.10", name: "PTSD", count: 4 }
                ],
                monthly_trend: [
                    { month: "Oct", sessions: 38, new_patients: 3 },
                    { month: "Nov", sessions: 42, new_patients: 5 },
                    { month: "Dec", sessions: 40, new_patients: 2 },
                    { month: "Jan", sessions: 45, new_patients: 4 }
                ]
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching clinical metrics' });
    }
};
