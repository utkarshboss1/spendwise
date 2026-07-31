const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { processReceiptOCR } = require('../controllers/ocrController');

const router = express.Router();

// Configure multer in-memory storage (max 5MB file size)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/ocr', protect, upload.single('receipt'), processReceiptOCR);

module.exports = router;
