const Income = require('../models/Income');
const Expense = require('../models/Expense');

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalIncomeResult = await Income.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalIncome = totalIncomeResult.length > 0 ? totalIncomeResult[0].total : 0;

    const totalExpenseResult = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalExpense = totalExpenseResult.length > 0 ? totalExpenseResult[0].total : 0;

    const totalBalance = totalIncome - totalExpense;

    const recentIncomes = await Income.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(10);
    const recentExpenses = await Expense.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(10);

    const formattedIncomes = recentIncomes.map((inc) => ({
      _id: inc._id,
      title: inc.title,
      amount: inc.amount,
      date: inc.date,
      description: inc.description,
      type: 'income',
    }));

    const formattedExpenses = recentExpenses.map((exp) => ({
      _id: exp._id,
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      date: exp.date,
      description: exp.description,
      type: 'expense',
    }));

    const recentTransactions = [...formattedIncomes, ...formattedExpenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    const categoryResult = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', amount: { $sum: '$amount' } } },
      { $sort: { amount: -1 } },
    ]);

    const categoryBreakdown = categoryResult.map((item) => ({
      category: item._id,
      amount: item.amount,
    }));

    const highestCategory = categoryBreakdown.length > 0
      ? categoryBreakdown[0]
      : { category: 'N/A', amount: 0 };

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const expensesLast6Months = await Expense.find({
      userId,
      date: { $gte: sixMonthsAgo },
    });
    const incomesLast6Months = await Income.find({
      userId,
      date: { $gte: sixMonthsAgo },
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrend = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const label = `${months[monthIndex]} ${year}`;

      const monthlyExpSum = expensesLast6Months
        .filter((exp) => {
          const expDate = new Date(exp.date);
          return expDate.getFullYear() === year && expDate.getMonth() === monthIndex;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

      const monthlyIncSum = incomesLast6Months
        .filter((inc) => {
          const incDate = new Date(inc.date);
          return incDate.getFullYear() === year && incDate.getMonth() === monthIndex;
        })
        .reduce((sum, inc) => sum + inc.amount, 0);

      monthlyTrend.push({
        label,
        year,
        month: monthIndex + 1,
        income: monthlyIncSum,
        expense: monthlyExpSum,
      });
    }

    res.json({
      totalIncome,
      totalExpense,
      totalBalance,
      recentTransactions,
      categoryBreakdown,
      highestSpendingCategory: highestCategory.category,
      highestSpendingAmount: highestCategory.amount,
      monthlyTrend,
    });
  } catch (error) {
    console.error(`Dashboard Analytics Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while compiling dashboard analytics' });
  }
};

module.exports = {
  getDashboardData,
};
