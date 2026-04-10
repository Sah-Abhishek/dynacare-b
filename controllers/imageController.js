const db = require('../config/db');
const { uploadToS3, deleteFromS3 } = require('../config/s3');

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const { label } = req.body;
        const fileSize = req.file.size;
        const mimeType = req.file.mimetype;
        const originalName = req.file.originalname;

        // Upload buffer to S3 (MinIO)
        const ext = (originalName || 'image.jpg').split('.').pop() || 'jpg';
        const s3Key = `dynacare/images/image_${Date.now()}_${Math.round(Math.random() * 1e6)}.${ext}`;
        const imageUrl = await uploadToS3(req.file.buffer, s3Key, mimeType);

        const result = await db.query(
            `INSERT INTO note_images (professional_id, image_url, original_name, label, file_size, mime_type, cloudinary_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [req.user.id, imageUrl, originalName, label || null, fileSize, mimeType, s3Key]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error uploading image:', err);
        res.status(500).json({ message: 'Error uploading image' });
    }
};

exports.getImages = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM note_images WHERE professional_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching images:', err);
        res.status(500).json({ message: 'Error fetching images' });
    }
};

exports.updateImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { label } = req.body;

        const result = await db.query(
            'UPDATE note_images SET label = $1 WHERE id = $2 AND professional_id = $3 RETURNING *',
            [label, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating image:', err);
        res.status(500).json({ message: 'Error updating image' });
    }
};

exports.deleteImage = async (req, res) => {
    try {
        const { id } = req.params;

        const image = await db.query(
            'SELECT * FROM note_images WHERE id = $1 AND professional_id = $2',
            [id, req.user.id]
        );

        if (image.rows.length === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Delete from S3 (cloudinary_id column now stores the S3 key)
        const s3Key = image.rows[0].cloudinary_id;
        if (s3Key) {
            try { await deleteFromS3(s3Key); } catch (e) { console.warn('S3 delete failed:', e.message); }
        }

        await db.query('DELETE FROM note_images WHERE id = $1 AND professional_id = $2', [id, req.user.id]);

        res.json({ message: 'Image deleted successfully' });
    } catch (err) {
        console.error('Error deleting image:', err);
        res.status(500).json({ message: 'Error deleting image' });
    }
};
