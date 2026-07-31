import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const ExpenseForm = ({ isOpen, onClose, onSubmit, expense = null, prefilledData = null, loading = false }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [errors, setErrors] = useState({});

  const categories = ['Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Others'];

  // Initialize fields for editing or fresh creation
  useEffect(() => {
    console.log("ExpenseForm opened");
    console.log("isOpen:", isOpen);
    console.log("prefilledData:", prefilledData);
    console.log("expense:", expense);

    if (expense) {
      console.log('[DEBUG_FORM] Initializing form for Edit Mode');
      setTitle(expense.title || '');
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setDescription(expense.description || '');
      const formattedDate = new Date(expense.date).toISOString().split('T')[0];
      setDate(formattedDate);
      setReceiptUrl(expense.receiptUrl || '');
    } else if (prefilledData) {
      console.log('[DEBUG_FORM] Initializing form with prefilledData (Receipt Scan Mode)');
      setTitle(prefilledData.title || '');
      setAmount(prefilledData.amount || '');
      setCategory(prefilledData.category || 'Food');
      setDescription(prefilledData.description || '');
      setDate(prefilledData.date || new Date().toISOString().split('T')[0]);
      setReceiptUrl(prefilledData.receiptUrl || '');
    } else {
      console.log('[DEBUG_FORM] Initializing empty form (Manual Mode)');
      setTitle('');
      setAmount('');
      setCategory('Food');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]); // Default to today
      setReceiptUrl('');
    }
    setErrors({});
  }, [expense, prefilledData, isOpen]);

  const validate = () => {
    const tempErrors = {};
    if (!title || title.trim() === '') {
      tempErrors.title = 'Title is required';
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      tempErrors.amount = 'Please enter a valid amount greater than 0';
    }
    if (!category) {
      tempErrors.category = 'Category is required';
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
      category,
      description: description.trim(),
      date,
      receiptUrl: receiptUrl.trim(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl shadow-xl overflow-hidden animate-slide-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-darkBorder">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {expense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grocery Shopping"
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

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-darkBorder bg-gray-50 dark:bg-darkBg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
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

          {/* Receipt URL */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Receipt Image URL (Optional)
            </label>
            <input
              type="text"
              value={receiptUrl}
              onChange={(e) => setReceiptUrl(e.target.value)}
              placeholder="https://example.com/receipt.jpg"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-darkBorder bg-gray-50 dark:bg-darkBg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this expense for?"
              rows="2"
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
              {loading ? 'Saving...' : 'Save Expense'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
