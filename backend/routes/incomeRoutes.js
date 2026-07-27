const express = require('express');
const router = express.Router();
const {
  createIncome,
  getIncomes,
  updateIncome,
  deleteIncome,
} = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');

// Protect all income routes
router.use(protect);

router.route('/')
  .get(getIncomes)
  .post(createIncome);

router.route('/:id')
  .put(updateIncome)
  .delete(deleteIncome);

module.exports = router;
