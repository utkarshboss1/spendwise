import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const IncomeForm = ({ isOpen, onClose, onSubmit, income = null, loading = false }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState({});

  // Initialize fields for editing or fresh creation
  useEffect(() => {
    if (income) {
      setTitle(income.title || '');
      setAmount(income.amount.toString());
      setDescription(income.description || '');
      // Format date to YYYY-MM-DD
      const formattedDate = new Date(income.date).toISOString().split('T')[0];
      setDate(formattedDate);
    } else {
      setTitle('');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]); // Default to today
    }
    setErrors({});
  }, [income, isOpen]);

  const validate = () => {
    const tempErrors = {};
    if (!title || title.trim() === '') {
      tempErrors.title = 'Title is required';
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      tempErrors.amount = 'Please enter a valid amount greater than 0';
    }
    if (!date) {
      tempErrors.date = 'Date is required';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      amount: parseFloat(amount),
      description: description.trim(),
      date,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl shadow-xl overflow-hidden animate-slide-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-darkBorder">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {income ? 'Edit Income' : 'Add New Income'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Monthly Salary"
              className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-darkBg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all ${
                errors.title ? 'border-rose-500' : 'border-gray-200 dark:border-darkBorder'
              }`}
            />
            {errors.title && (
              <span className="flex items-center gap-1 text-xs text-rose-500 font-semibold mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </span>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-darkBg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all ${
                errors.amount ? 'border-rose-500' : 'border-gray-200 dark:border-darkBorder'
              }`}
            />
            {errors.amount && (
              <span className="flex items-center gap-1 text-xs text-rose-500 font-semibold mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.amount}
              </span>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-darkBg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all cursor-pointer ${
                errors.date ? 'border-rose-500' : 'border-gray-200 dark:border-darkBorder'
              }`}
            />
            {errors.date && (
              <span className="flex items-center gap-1 text-xs text-rose-500 font-semibold mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.date}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this income from?"
              rows="3"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-darkBorder bg-gray-50 dark:bg-darkBg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-darkBorder">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-darkBorder rounded-xl hover:bg-gray-50 dark:hover:bg-darkCard transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-primary-505 text-white hover:bg-primary-600 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Income'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default IncomeForm;
