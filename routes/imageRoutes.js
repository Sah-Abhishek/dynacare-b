const express = require('express');
const router = express.Router();
const multer = require('multer');
const imageController = require('../controllers/imageController');
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
            'image/webp', 'image/svg+xml', 'image/bmp'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, PNG, GIF, WebP, SVG, BMP) are allowed'), false);
        }
    }
});

router.use(authMiddleware);

router.post('/upload', upload.single('image'), imageController.uploadImage);
router.get('/', imageController.getImages);
router.patch('/:id', imageController.updateImage);
router.delete('/:id', imageController.deleteImage);

module.exports = router;
