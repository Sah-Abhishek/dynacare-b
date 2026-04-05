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
    const { type, name, detail, notes } = req.body;
    try {
        const newItem = await db.query(
            'INSERT INTO medical_history (patient_id, type, name, detail, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.params.patientId, type, name, detail, notes || null]
        );
        res.status(201).json(newItem.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding medical history item' });
    }
};

exports.updateMedicalHistory = async (req, res) => {
    const { type, name, detail, notes } = req.body;
    try {
        const updated = await db.query(
            'UPDATE medical_history SET type = $1, name = $2, detail = $3, notes = $4 WHERE id = $5 RETURNING *',
            [type, name, detail, notes || null, req.params.historyId]
        );
        if (updated.rows.length === 0) {
            return res.status(404).json({ message: 'Medical history item not found' });
        }
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating medical history item' });
    }
};

exports.deleteMedicalHistory = async (req, res) => {
    try {
        const deleted = await db.query(
            'DELETE FROM medical_history WHERE id = $1 RETURNING *',
            [req.params.historyId]
        );
        if (deleted.rows.length === 0) {
            return res.status(404).json({ message: 'Medical history item not found' });
        }
        res.json({ message: 'Medical history item deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting medical history item' });
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

exports.updateMedication = async (req, res) => {
    const { name, dosage, frequency, status, prescribed_by, start_date, notes } = req.body;
    try {
        const updated = await db.query(
            'UPDATE medications SET name = $1, dosage = $2, frequency = $3, status = $4, prescribed_by = $5, start_date = $6, notes = $7 WHERE id = $8 RETURNING *',
            [name, dosage, frequency, status, prescribed_by, start_date, notes, req.params.id]
        );
        if (updated.rows.length === 0) {
            return res.status(404).json({ message: 'Medication not found' });
        }
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating medication' });
    }
};

exports.deleteMedication = async (req, res) => {
    try {
        const deleted = await db.query('DELETE FROM medications WHERE id = $1 RETURNING *', [req.params.id]);
        if (deleted.rows.length === 0) {
            return res.status(404).json({ message: 'Medication not found' });
        }
        res.json({ message: 'Medication deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting medication' });
    }
};

exports.addDiagnosis = async (req, res) => {
    const { dsm_code, disorder_name, diagnosed_date, status, doctor_name, notes } = req.body;
    try {
        const newDiag = await db.query(
            'INSERT INTO diagnoses (patient_id, dsm_code, disorder_name, diagnosed_date, status, doctor_name, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [req.params.patientId, dsm_code, disorder_name, diagnosed_date, status, doctor_name, notes]
        );
        res.status(201).json(newDiag.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding diagnosis' });
    }
};

exports.updateDiagnosis = async (req, res) => {
    const { dsm_code, disorder_name, diagnosed_date, status, doctor_name, notes } = req.body;
    try {
        const updated = await db.query(
            'UPDATE diagnoses SET dsm_code = $1, disorder_name = $2, diagnosed_date = $3, status = $4, doctor_name = $5, notes = $6 WHERE id = $7 RETURNING *',
            [dsm_code, disorder_name, diagnosed_date, status, doctor_name, notes, req.params.id]
        );
        if (updated.rows.length === 0) {
            return res.status(404).json({ message: 'Diagnosis not found' });
        }
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating diagnosis' });
    }
};

exports.deleteDiagnosis = async (req, res) => {
    try {
        const deleted = await db.query('DELETE FROM diagnoses WHERE id = $1 RETURNING *', [req.params.id]);
        if (deleted.rows.length === 0) {
            return res.status(404).json({ message: 'Diagnosis not found' });
        }
        res.json({ message: 'Diagnosis deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting diagnosis' });
    }
};

exports.addTreatmentPlan = async (req, res) => {
    const { goal, intervention, progress_notes, status } = req.body;
    try {
        const newPlan = await db.query(
            'INSERT INTO treatment_plans (patient_id, goal, intervention, progress_notes, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.params.patientId, goal, intervention, progress_notes, status || 'Active']
        );
        res.status(201).json(newPlan.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding treatment plan' });
    }
};

exports.updateTreatmentPlan = async (req, res) => {
    const { goal, intervention, progress_notes, status } = req.body;
    try {
        const updated = await db.query(
            'UPDATE treatment_plans SET goal = $1, intervention = $2, progress_notes = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [goal, intervention, progress_notes, status, req.params.id]
        );
        if (updated.rows.length === 0) {
            return res.status(404).json({ message: 'Treatment plan not found' });
        }
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating treatment plan' });
    }
};

exports.deleteTreatmentPlan = async (req, res) => {
    try {
        const deleted = await db.query('DELETE FROM treatment_plans WHERE id = $1 RETURNING *', [req.params.id]);
        if (deleted.rows.length === 0) {
            return res.status(404).json({ message: 'Treatment plan not found' });
        }
        res.json({ message: 'Treatment plan deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting treatment plan' });
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
