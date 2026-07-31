import React from 'react';
import { Edit2, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

const ExpenseTable = ({
  expenses = [],
  onEdit,
  onDelete,
  page = 1,
  pages = 1,
  onPageChange,
}) => {
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (expenses.length === 0) {
    return (
      <div className="w-full text-center py-16 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl">
        <p className="text-gray-400 dark:text-gray-500 font-semibold">No expenses found matching the criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table for Desktop, Cards for Mobile */}
      <div className="overflow-hidden bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl shadow-sm">
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-darkBg/50 border-b border-gray-200 dark:border-darkBorder text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Title</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-darkBorder text-sm font-medium text-gray-700 dark:text-gray-300">
              {expenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-50/50 dark:hover:bg-darkBg/20 transition-colors">
                  <td className="py-4 px-6">{formatDate(expense.date)}</td>
                  <td className="py-4 px-6 font-bold text-gray-900 dark:text-white max-w-xs truncate" title={expense.title}>
                    {expense.title}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${categoryStyles[expense.category] || categoryStyles.Others}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 max-w-xs truncate" title={expense.description}>
                    {expense.description || <span className="text-gray-400 dark:text-gray-600 italic">No description</span>}
                  </td>
                  <td className="py-4 px-6 text-right font-extrabold text-gray-900 dark:text-white">
                    -₹{expense.amount.toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      {expense.receiptUrl && (
                        <a
                          href={expense.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary-55 hover:underline font-bold mr-2"
                        >
                          Receipt
                        </a>
                      )}
                      <button
                        onClick={() => onEdit(expense)}
                        className="p-1.5 text-gray-500 hover:text-primary-505 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-darkBg rounded-lg transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(expense._id)}
                        className="p-1.5 text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-darkBg rounded-lg transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="block md:hidden divide-y divide-gray-100 dark:divide-darkBorder">
          {expenses.map((expense) => (
            <div key={expense._id} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-gray-900 dark:text-white">
                    {expense.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 dark:text-gray-400 font-bold">
                      {formatDate(expense.date)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${categoryStyles[expense.category] || categoryStyles.Others}`}>
                      {expense.category}
                    </span>
                  </div>
                </div>
                <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                  -₹{expense.amount.toFixed(2)}
                </span>
              </div>
              
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-2">
                {expense.description || <span className="text-gray-400 dark:text-gray-600 italic">No description</span>}
              </p>
              
              <div className="flex justify-between items-center pt-2">
                <div>
                  {expense.receiptUrl && (
                    <a
                      href={expense.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary-505 hover:underline font-bold"
                    >
                      View Receipt
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(expense)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-gray-200 dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-darkBg rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(expense._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-transparent hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Pagination Controls */}
      {pages > 1 && (
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            Page {page} of {pages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-lg hover:bg-gray-50 dark:hover:bg-darkBg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === pages}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-lg hover:bg-gray-50 dark:hover:bg-darkBg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTable;
