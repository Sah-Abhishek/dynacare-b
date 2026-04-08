const db = require('../config/db');
const { uploadToS3, getFromS3, deleteFromS3 } = require('../config/s3');

// Save a generated PDF report: upload to S3 under dyncare-docs/, persist row.
exports.saveReport = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    const { patient_id, session_id, title, summary } = req.body;

    if (!patient_id) {
        return res.status(400).json({ message: 'patient_id is required' });
    }

    try {
        const professional_id = req.user?.id || 1;

        // Build a unique S3 key under dyncare-docs/
        const safeName = (req.file.originalname || 'report.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
        const s3Key = `dyncare-docs/patient_${patient_id}/${Date.now()}_${Math.round(Math.random() * 1e6)}_${safeName}`;

        const fileUrl = await uploadToS3(req.file.buffer, s3Key, req.file.mimetype || 'application/pdf');

        // summary may arrive as a JSON string from multipart; try to parse, otherwise store as-is
        let summaryJson = null;
        if (summary) {
            if (typeof summary === 'string') {
                try { summaryJson = JSON.parse(summary); } catch { summaryJson = { raw: summary }; }
            } else {
                summaryJson = summary;
            }
        }

        const result = await db.query(
            `INSERT INTO reports (patient_id, professional_id, session_id, title, file_name, file_url, s3_key, file_size, summary)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [
                patient_id,
                professional_id,
                session_id || null,
                title || safeName,
                safeName,
                fileUrl,
                s3Key,
                req.file.size || null,
                summaryJson,
            ]
        );

        // Activity log (best-effort)
        if (req.user?.id) {
            try {
                await db.query(
                    'INSERT INTO activity_logs (user_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)',
                    [req.user.id, 'Saved clinical report', 'Report', result.rows[0].id]
                );
            } catch (e) { /* non-fatal */ }
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error saving report:', err.message);
        res.status(500).json({ message: `Error saving report: ${err.message}` });
    }
};

// List reports — optionally filtered by patientId, scoped to current professional.
exports.listReports = async (req, res) => {
    try {
        const professional_id = req.user?.id || 1;
        const { patientId } = req.query;

        let query = `
            SELECT r.id, r.patient_id, r.professional_id, r.session_id, r.title,
                   r.file_name, r.file_url, r.file_size, r.created_at,
                   p.full_name AS patient_name
            FROM reports r
            LEFT JOIN patients p ON r.patient_id = p.id
            WHERE r.professional_id = $1`;
        const params = [professional_id];

        if (patientId) {
            params.push(patientId);
            query += ` AND r.patient_id = $${params.length}`;
        }

        query += ` ORDER BY r.created_at DESC`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error listing reports:', err.message);
        res.status(500).json({ message: `Error listing reports: ${err.message}` });
    }
};

// Download a saved report. Auth via Authorization header OR ?token= query param,
// so anchor tags / window.open can be used directly.
exports.downloadReport = async (req, res) => {
    const { id } = req.params;

    // Allow token via query param for direct download links
    let user = req.user;
    if (!user) {
        const token = req.query.token || req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'Authorization required' });
        try {
            const jwt = require('jsonwebtoken');
            user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }

    try {
        const result = await db.query(
            `SELECT s3_key, file_name FROM reports WHERE id = $1 AND professional_id = $2`,
            [id, user.id || 1]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const { s3_key, file_name } = result.rows[0];
        const s3Response = await getFromS3(s3_key);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${file_name}"`);
        if (s3Response.ContentLength) {
            res.setHeader('Content-Length', s3Response.ContentLength);
        }

        // Body is a Node Readable stream from the AWS SDK v3
        s3Response.Body.pipe(res);
    } catch (err) {
        console.error('Error downloading report:', err.message);
        res.status(500).json({ message: `Error downloading report: ${err.message}` });
    }
};

exports.deleteReport = async (req, res) => {
    const { id } = req.params;
    try {
        const professional_id = req.user?.id || 1;
        const result = await db.query(
            `SELECT s3_key FROM reports WHERE id = $1 AND professional_id = $2`,
            [id, professional_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }
        // Best-effort S3 cleanup; still delete the row even if S3 fails
        try { await deleteFromS3(result.rows[0].s3_key); } catch (e) { console.warn('S3 delete failed:', e.message); }
        await db.query('DELETE FROM reports WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting report:', err.message);
        res.status(500).json({ message: `Error deleting report: ${err.message}` });
    }
};
