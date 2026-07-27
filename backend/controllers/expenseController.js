const Expense = require('../models/Expense');
const mongoose = require('mongoose');

const createExpense = async (req, res) => {
  try {
    const { title, amount, category, description, date, receiptUrl } = req.body;

    if (!title || amount === undefined || !category || !date) {
      return res.status(400).json({ message: 'Please provide title, amount, category, and date' });
    }

    if (amount < 0) {
      return res.status(400).json({ message: 'Amount cannot be negative' });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      title,
      amount,
      category,
      description: description || '',
      date,
      receiptUrl: receiptUrl || '',
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error(`Create Expense Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while creating expense' });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { search, category, startDate, endDate, page = 1, limit = 10, sort = 'newest' } = req.query;

    const query = { userId: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
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

    const expenses = await Expense.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNumber);

    const total = await Expense.countDocuments(query);

    res.json({
      expenses,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      total,
    });
  } catch (error) {
    console.error(`Get Expenses Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while fetching expenses' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { title, amount, category, description, date, receiptUrl } = req.body;
    const expenseId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ message: 'Invalid expense ID' });
    }

    let expense = await Expense.findOne({ _id: expenseId, userId: req.user._id });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (title !== undefined) expense.title = title;
    if (amount !== undefined) {
      if (amount < 0) {
        return res.status(400).json({ message: 'Amount cannot be negative' });
      }
      expense.amount = amount;
    }
    if (category) expense.category = category;
    if (description !== undefined) expense.description = description;
    if (date) expense.date = date;
    if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    console.error(`Update Expense Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while updating expense' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ message: 'Invalid expense ID' });
    }

    const expense = await Expense.findOneAndDelete({ _id: expenseId, userId: req.user._id });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense removed successfully', id: expenseId });
  } catch (error) {
    console.error(`Delete Expense Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while deleting expense' });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
};
