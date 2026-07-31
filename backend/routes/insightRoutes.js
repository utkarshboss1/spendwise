const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getAIInsights } = require('../controllers/insightController');

const router = express.Router();

router.get('/insights', protect, getAIInsights);

module.exports = router;
