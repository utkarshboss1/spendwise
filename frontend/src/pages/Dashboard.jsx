import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardApi from '../api/dashboardApi';
import expenseApi from '../api/expenseApi';
import DashboardStats from '../components/Dashboard/DashboardStats';
import CategoryPieChart from '../components/Dashboard/CategoryPieChart';
import SpendingTrendChart from '../components/Dashboard/SpendingTrendChart';
import ExpenseForm from '../components/Expense/ExpenseForm';
import AIInsightsCard from '../components/ai/AIInsightsCard';
import Loader from '../components/Common/Loader';
import { useToast } from '../context/ToastContext';
import { Plus, ArrowRight, Receipt, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error(error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddExpense = async (expenseData) => {
    try {
      setFormSubmitting(true);
      await expenseApi.createExpense(expenseData);
      showToast('Expense added successfully', 'success');
      setIsFormOpen(false);
      
      // Refresh dashboard data
      const updated = await dashboardApi.getDashboardData();
      setDashboardData(updated);
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Failed to add expense', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const categoryStyles = {
    Food: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
    Travel: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
    Shopping: 'bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-400 border-pink-200 dark:border-pink-900/50',
    Entertainment: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-900/50',
    Bills: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
    Healthcare: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
    Education: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/50',
    Others: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-400 border-gray-200 dark:border-gray-800/50',
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-slide-in">
      
      {/* Welcome header & Quick Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Hi, {user?.name || 'User'} 👋
          </h1>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
            Here's a breakdown of your current finance metrics
          </p>
        </div>
        
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-505 hover:bg-primary-600 text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-primary-505/20 hover:shadow-primary-600/30 transition-all hover:-translate-y-0.5 focus:outline-none"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      {/* Stats and AI Insights Row */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <DashboardStats
            totalIncome={dashboardData?.totalIncome}
            totalExpense={dashboardData?.totalExpense}
            totalBalance={dashboardData?.totalBalance}
          />
        </div>
        <div className="xl:col-span-1">
          <AIInsightsCard />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Monthly Trend Chart Card */}
        <div className="p-6 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Cashflow History
            </h2>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">
              Monthly overview of income vs expenditures over the last 6 months
            </p>
          </div>
          <SpendingTrendChart trendData={dashboardData?.monthlyTrend} />
        </div>

        {/* Category Breakdown Chart Card */}
        <div className="p-6 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Category Breakdown
            </h2>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">
              Distribution of all-time expenses per category
            </p>
          </div>
          <CategoryPieChart categoryData={dashboardData?.categoryBreakdown} />
        </div>

      </div>

      {/* Recent Transactions List */}
      <div className="p-6 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Transactions
            </h2>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">
              Your latest 10 cashflow records
            </p>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="flex items-center gap-1 text-xs font-bold text-primary-505 dark:text-primary-400 hover:text-primary-600 transition-colors"
          >
            View All Ledger
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Transactions Stack */}
        {!dashboardData?.recentTransactions || dashboardData.recentTransactions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">
              No recent transactions found. Let's record your first transaction!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-darkBorder">
            {dashboardData.recentTransactions.map((tx) => (
              <div key={`${tx.type}-${tx._id}`} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    tx.type === 'income'
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-450'
                      : 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-450'
                  }`}>
                    {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {tx.title}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold mt-0.5">
                      {new Date(tx.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {tx.type === 'expense' ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${categoryStyles[tx.category] || categoryStyles.Others}`}>
                      {tx.category}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30">
                      Income
                    </span>
                  )}
                  <span className={`text-base font-extrabold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                    {tx.type === 'income' ? '+₹' : '-₹'}{tx.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Expense Modal */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddExpense}
        loading={formSubmitting}
      />

    </div>
  );
};

export default Dashboard;
