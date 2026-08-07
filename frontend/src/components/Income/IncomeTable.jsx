import React from 'react';
import { Edit2, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

const IncomeTable = ({
  incomes = [],
  onEdit,
  onDelete,
  page = 1,
  pages = 1,
  onPageChange,
}) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (incomes.length === 0) {
    return (
      <div className="w-full text-center py-16 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl">
        <p className="text-gray-400 dark:text-gray-500 font-semibold">No incomes found matching the criteria.</p>
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
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-darkBorder text-sm font-medium text-gray-700 dark:text-gray-300">
              {incomes.map((income) => (
                <tr key={income._id} className="hover:bg-gray-50/50 dark:hover:bg-darkBg/20 transition-colors">
                  <td className="py-4 px-6">{formatDate(income.date)}</td>
                  <td className="py-4 px-6 font-bold text-gray-900 dark:text-white max-w-xs truncate" title={income.title}>
                    {income.title}
                  </td>
                  <td className="py-4 px-6 max-w-xs truncate" title={income.description}>
                    {income.description || <span className="text-gray-400 dark:text-gray-600 italic">No description</span>}
                  </td>
                  <td className="py-4 px-6 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                    +₹{income.amount.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(income)}
                        className="p-1.5 text-gray-500 hover:text-primary-505 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-darkBg rounded-lg transition-colors"
                        title="Edit Income"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(income._id)}
                        className="p-1.5 text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-darkBg rounded-lg transition-colors"
                        title="Delete Income"
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
          {incomes.map((income) => (
            <div key={income._id} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-gray-900 dark:text-white">
                    {income.title}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-bold block">
                    {formatDate(income.date)}
                  </span>
                </div>
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  +₹{income.amount.toFixed(2)}
                </span>
              </div>
              
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-2">
                {income.description || <span className="text-gray-400 dark:text-gray-600 italic">No description</span>}
              </p>
              
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => onEdit(income)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-gray-200 dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-darkBg rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(income._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-transparent hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
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

export default IncomeTable;
