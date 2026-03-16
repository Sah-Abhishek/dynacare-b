const db = require('../config/db');
const fs = require('fs');
const path = require('path');

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const { label } = req.body;
        const imageUrl = `/uploads/images/${req.file.filename}`;
        const fileSize = req.file.size;
        const mimeType = req.file.mimetype;
        const originalName = req.file.originalname;

        const result = await db.query(
            `INSERT INTO note_images (professional_id, image_url, original_name, label, file_size, mime_type)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [req.user.id, imageUrl, originalName, label || null, fileSize, mimeType]
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

        const filePath = path.join(__dirname, '..', image.rows[0].image_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await db.query('DELETE FROM note_images WHERE id = $1 AND professional_id = $2', [id, req.user.id]);

        res.json({ message: 'Image deleted successfully' });
    } catch (err) {
        console.error('Error deleting image:', err);
        res.status(500).json({ message: 'Error deleting image' });
    }
};
