const Income = require('../models/Income');
const mongoose = require('mongoose');

const createIncome = async (req, res) => {
  try {
    const { title, amount, description, date } = req.body;

    if (!title || amount === undefined || !date) {
      return res.status(400).json({ message: 'Please provide title, amount, and date' });
    }

    if (amount < 0) {
      return res.status(400).json({ message: 'Amount cannot be negative' });
    }

    const income = await Income.create({
      userId: req.user._id,
      title,
      amount,
      description: description || '',
      date,
    });

    res.status(201).json(income);
  } catch (error) {
    console.error(`Create Income Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while creating income' });
  }
};

const getIncomes = async (req, res) => {
  try {
    const { search, startDate, endDate, page = 1, limit = 10, sort = 'newest' } = req.query;

    const query = { userId: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    let sortQuery = { date: -1, createdAt: -1 };
    if (sort === 'oldest') {
      sortQuery = { date: 1, createdAt: 1 };
    }

    const incomes = await Income.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNumber);

    const total = await Income.countDocuments(query);

    res.json({
      incomes,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      total,
    });
  } catch (error) {
    console.error(`Get Incomes Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while fetching incomes' });
  }
};

const updateIncome = async (req, res) => {
  try {
    const { title, amount, description, date } = req.body;
    const incomeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(incomeId)) {
      return res.status(400).json({ message: 'Invalid income ID' });
    }

    let income = await Income.findOne({ _id: incomeId, userId: req.user._id });

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    if (title !== undefined) income.title = title;
    if (amount !== undefined) {
      if (amount < 0) {
        return res.status(400).json({ message: 'Amount cannot be negative' });
      }
      income.amount = amount;
    }
    if (description !== undefined) income.description = description;
    if (date) income.date = date;

    const updatedIncome = await income.save();
    res.json(updatedIncome);
  } catch (error) {
    console.error(`Update Income Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while updating income' });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const incomeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(incomeId)) {
      return res.status(400).json({ message: 'Invalid income ID' });
    }

    const income = await Income.findOneAndDelete({ _id: incomeId, userId: req.user._id });

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json({ message: 'Income removed successfully', id: incomeId });
  } catch (error) {
    console.error(`Delete Income Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while deleting income' });
  }
};

module.exports = {
  createIncome,
  getIncomes,
  updateIncome,
  deleteIncome,
};
