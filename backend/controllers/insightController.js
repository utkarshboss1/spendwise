const Income = require('../models/Income');
const Expense = require('../models/Expense');
const aiService = require('../services/ai/aiService');

const categoryBudgets = {
  Food: 8000,         // ₹8,000
  Shopping: 6000,     // ₹6,000
  Travel: 5000,       // ₹5,000
  Bills: 15000,       // ₹15,000
  Entertainment: 4000,// ₹4,000
  Healthcare: 5000,   // ₹5,000
  Education: 10000,   // ₹10,000
  Others: 3000,       // ₹3,000
};

const getAIInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    // Define date ranges
    const now = new Date();
    
    // Current Month Range
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const daysElapsed = now.getDate();

    // Previous Month Range
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // 1. Fetch current month expenses & incomes
    const currentExpenses = await Expense.find({
      userId,
      date: { $gte: currentStart, $lte: currentEnd },
    });
    const currentIncomes = await Income.find({
      userId,
      date: { $gte: currentStart, $lte: currentEnd },
    });

    // 2. Fetch previous month expenses
    const prevExpenses = await Expense.find({
      userId,
      date: { $gte: prevStart, $lte: prevEnd },
    });

    // Calculate Current Month Totals
    const currentIncomeTotal = currentIncomes.reduce((sum, inc) => sum + inc.amount, 0);
    const currentExpenseTotal = currentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const savings = currentIncomeTotal - currentExpenseTotal;

    // Calculate Category Spending
    const currentCategoryTotals = {};
    currentExpenses.forEach((exp) => {
      currentCategoryTotals[exp.category] = (currentCategoryTotals[exp.category] || 0) + exp.amount;
    });

    // Find Highest Category
    let highestCategory = 'N/A';
    let highestSpendingAmount = 0;
    Object.entries(currentCategoryTotals).forEach(([cat, val]) => {
      if (val > highestSpendingAmount) {
        highestSpendingAmount = val;
        highestCategory = cat;
      }
    });

    // Calculate Budget Overruns
    const budgetExceeded = [];
    Object.entries(categoryBudgets).forEach(([cat, limit]) => {
      const spent = currentCategoryTotals[cat] || 0;
      if (spent > limit) {
        budgetExceeded.push(cat);
      }
    });

    // Calculate Monthly Comparison
    const prevExpenseTotal = prevExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const monthlyComparisonPercent = prevExpenseTotal > 0
      ? (((currentExpenseTotal - prevExpenseTotal) / prevExpenseTotal) * 100).toFixed(0)
      : 0;
    const monthlyComparisonText = monthlyComparisonPercent > 0 
      ? `increased by ${monthlyComparisonPercent}%` 
      : `decreased by ${Math.abs(monthlyComparisonPercent)}%`;

    // Calculate Category Percentages & Comparison per category (focus on top categories)
    const categoryPercentages = {};
    Object.entries(currentCategoryTotals).forEach(([cat, val]) => {
      categoryPercentages[cat] = currentExpenseTotal > 0
        ? parseFloat(((val / currentExpenseTotal) * 100).toFixed(1))
        : 0;
    });

    // Calculate Average Daily Spending
    const avgDailySpending = parseFloat((currentExpenseTotal / (daysElapsed || 1)).toFixed(2));

    // 3. Compile clean statistical payload for AI (never send raw transaction arrays)
    const statsPayload = {
      income: currentIncomeTotal,
      expense: currentExpenseTotal,
      savings,
      highestCategory,
      highestCategorySpent: highestSpendingAmount,
      totalSpendingComparison: monthlyComparisonText,
      budgetExceeded,
      averageDailySpending: avgDailySpending,
      categoryPercentages,
    };

    // 4. Request insights from Gemini AI service
    const aiInsights = await aiService.compileSpendingInsights(statsPayload);

    // Return calculations (MERN truth source) + AI explanations/recommendations
    res.json({
      calculations: {
        currentIncomeTotal,
        currentExpenseTotal,
        savings,
        highestCategory,
        highestSpendingAmount,
        prevExpenseTotal,
        monthlyComparisonPercent: parseFloat(monthlyComparisonPercent),
        avgDailySpending,
        categoryBudgets,
        categoryTotals: currentCategoryTotals,
        budgetExceeded,
      },
      aiInsights,
    });
  } catch (error) {
    console.error(`Get AI Insights Error: ${error.message}`);
    res.status(500).json({ message: 'Server error compiling AI insights' });
  }
};

module.exports = {
  getAIInsights,
};
