const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { processReceiptOCR } = require('../controllers/ocrController');

const router = express.Router();

// Allowed image and document MIME types for Mindee Receipt OCR
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
  'image/heic',
  'application/pdf',
];

// Configure multer in-memory storage (max 10MB file size, image/pdf filter)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload a receipt image (JPEG, PNG, WebP, HEIC) or PDF.'));
    }
  },
});

router.post('/ocr', protect, upload.single('receipt'), processReceiptOCR);

module.exports = router;
