import React, { useEffect, useState } from 'react';
import expenseApi from '../api/expenseApi';
import incomeApi from '../api/incomeApi';
import Loader from '../components/Common/Loader';
import { useToast } from '../context/ToastContext';
import { Search, Calendar, RefreshCw, ArrowUpRight, ArrowDownRight, ArrowLeft, ArrowRight } from 'lucide-react';

const Transactions = () => {
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all'); // all, income, expense
  const [category, setCategory] = useState('all'); // all, or specific
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState('newest'); // newest, oldest
  
  // Client-side Pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  const categories = ['Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Others'];

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Fetch reasonably large datasets to merge client-side
      const [expensesData, incomesData] = await Promise.all([
        expenseApi.getExpenses({ limit: 1000 }),
        incomeApi.getIncomes({ limit: 1000 }),
      ]);

      const formattedIncomes = (incomesData.incomes || []).map((inc) => ({
        ...inc,
        type: 'income',
      }));

      const formattedExpenses = (expensesData.expenses || []).map((exp) => ({
        ...exp,
        type: 'expense',
      }));

      setTransactions([...formattedIncomes, ...formattedExpenses]);
    } catch (error) {
      console.error(error);
      showToast('Failed to load transaction history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleClearFilters = () => {
    setSearch('');
    setType('all');
    setCategory('all');
    setStartDate('');
    setEndDate('');
    setSort('newest');
    setPage(1);
  };

  // 1. Filtering
  const filteredTransactions = transactions.filter((tx) => {
    // Search filter
    if (search) {
      const matchSearch =
        (tx.title && tx.title.toLowerCase().includes(search.toLowerCase())) ||
        (tx.description && tx.description.toLowerCase().includes(search.toLowerCase()));
      if (!matchSearch) return false;
    }

    // Type filter
    if (type !== 'all' && tx.type !== type) {
      return false;
    }

    // Category filter (only for expenses)
    if (category !== 'all') {
      if (tx.type === 'income') return false; // income has no category
      if (tx.category !== category) return false;
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate);
      if (new Date(tx.date) < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (new Date(tx.date) > end) return false;
    }

    return true;
  });

  // 2. Sorting
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (sort === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, type, category, startDate, endDate, sort]);

  // 3. Client Pagination
  const totalItems = sortedTransactions.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + limit);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-slide-in">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Transactions Ledger
        </h1>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
          Consolidated list of your financial records including both income and expenses
        </p>
      </div>

      {/* Filter Row */}
      <div className="p-5 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl shadow-sm flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title/desc..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-darkBg text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-darkBg text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={type === 'income'}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-darkBg text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-darkBg text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all cursor-pointer"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-darkBg text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all cursor-pointer"
            />
          </div>

          {/* Sort */}
          <div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-darkBg text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

        </div>

        {/* Clear Filters */}
        {(search || type !== 'all' || category !== 'all' || startDate || endDate || sort !== 'newest') && (
          <div className="flex justify-end">
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-darkBg rounded-xl transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      {loading ? (
        <Loader />
      ) : paginatedTransactions.length === 0 ? (
        <div className="w-full text-center py-16 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl">
          <p className="text-gray-400 dark:text-gray-500 font-semibold">No transactions found matching the criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl shadow-sm">
            
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-darkBg/50 border-b border-gray-200 dark:border-darkBorder text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-darkBorder text-sm font-medium text-gray-700 dark:text-gray-300">
                  {paginatedTransactions.map((tx) => (
                    <tr key={`${tx.type}-${tx._id}`} className="hover:bg-gray-50/50 dark:hover:bg-darkBg/20 transition-colors">
                      <td className="py-4 px-6">{formatDate(tx.date)}</td>
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white max-w-xs truncate" title={tx.title}>
                        {tx.title}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          tx.type === 'income' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                        }`}>
                          {tx.type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {tx.type === 'expense' ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${categoryStyles[tx.category] || categoryStyles.Others}`}>
                            {tx.category}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-650">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate" title={tx.description}>
                        {tx.description || <span className="text-gray-400 dark:text-gray-600 italic">No description</span>}
                      </td>
                      <td className={`py-4 px-6 text-right font-extrabold ${
                        tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {tx.type === 'income' ? '+₹' : '-₹'}{tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden divide-y divide-gray-100 dark:divide-darkBorder">
              {paginatedTransactions.map((tx) => (
                <div key={`${tx.type}-${tx._id}`} className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-base text-gray-900 dark:text-white">{tx.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-gray-500 dark:text-gray-400 font-bold">{formatDate(tx.date)}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.type === 'income' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                        }`}>
                          {tx.type}
                        </span>
                        {tx.type === 'expense' && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${categoryStyles[tx.category] || categoryStyles.Others}`}>
                            {tx.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-lg font-extrabold ${
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {tx.type === 'income' ? '+₹' : '-₹'}{tx.amount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-2">
                    {tx.description || <span className="text-gray-400 dark:text-gray-600 italic">No description</span>}
                  </p>
                </div>
              ))}
            </div>

          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-lg hover:bg-gray-50 dark:hover:bg-darkBg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-lg hover:bg-gray-50 dark:hover:bg-darkBg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Transactions;
