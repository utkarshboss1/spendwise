import React, { useEffect, useState, useCallback } from 'react';
import expenseApi from '../api/expenseApi';
import FilterBar from '../components/Expense/FilterBar';
import ExpenseTable from '../components/Expense/ExpenseTable';
import ExpenseForm from '../components/Expense/ExpenseForm';
import AddExpenseChoiceModal from '../components/Expense/AddExpenseChoiceModal';
import Loader from '../components/Common/Loader';
import { useToast } from '../context/ToastContext';
import { Plus, Sparkles } from 'lucide-react';

const Expenses = () => {
  const { showToast } = useToast();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal States
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [prefilledData, setPrefilledData] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await expenseApi.getExpenses({
        search,
        category,
        startDate,
        endDate,
        page,
        limit: 10,
      });
      setExpenses(data.expenses);
      setPages(data.pages);
    } catch (error) {
      console.error(error);
      showToast('Failed to load expenses list', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, category, startDate, endDate, page]);

  useEffect(() => {
    // Whenever filters change, reset page back to 1
    setPage(1);
  }, [search, category, startDate, endDate]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleCreateOrUpdateExpense = async (expenseData) => {
    try {
      setFormSubmitting(true);
      if (editingExpense) {
        // Edit Mode
        await expenseApi.updateExpense(editingExpense._id, expenseData);
        showToast('Expense updated successfully', 'success');
      } else {
        // Add Mode
        await expenseApi.createExpense(expenseData);
        showToast('Expense added successfully', 'success');
      }
      setIsFormOpen(false);
      setEditingExpense(null);
      setPrefilledData(null);
      loadExpenses();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Failed to save expense', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleReceiptParsed = async (parsedData, classification) => {
    console.log("========== handleReceiptParsed ==========");
    console.log("parsedData:", parsedData);
    console.log("classification:", classification);
    console.log('[DEBUG_FLOW] handleReceiptParsed triggered');
    console.log('[DEBUG_FLOW] parsedData:', parsedData);
    console.log('[DEBUG_FLOW] classification:', classification);

    try {
      setFormSubmitting(true);
      
      const expenseTitle = classification?.title || parsedData?.merchant || 'Receipt Purchase';
      const expenseAmount = parsedData?.amount || 0;
      const expenseCategory = classification?.category || 'Others';
      const expenseDate = parsedData?.date || new Date().toISOString().split('T')[0];
      const itemsText = parsedData?.items && parsedData.items.length > 0
        ? ` (Items: ${parsedData.items.join(', ')})`
        : '';
      const expenseDescription = `${classification?.description || 'Auto-extracted receipt details'}${itemsText}`;

      console.log('[DEBUG_FLOW] Parsed details:', {
        expenseTitle,
        expenseAmount,
        expenseCategory,
        expenseDate,
        expenseDescription,
        confidence: classification?.confidence
      });

      // Auto-log immediately if confidence is high, merchant name is valid, and amount is present
      if (
        classification?.confidence >= 0.85 && 
        expenseAmount > 0 && 
        expenseTitle && 
        expenseTitle.toLowerCase() !== 'unknown merchant'
      ) {
        console.log('[DEBUG_FLOW] Match found for auto-log (confidence >= 0.85). Saving directly to database.');
        const savedExpense = await expenseApi.createExpense({
          title: expenseTitle,
          amount: expenseAmount,
          category: expenseCategory,
          date: expenseDate,
          description: expenseDescription,
        });
        console.log('[DEBUG_FLOW] Expense created successfully via auto-log:', savedExpense);
        showToast(`Auto-logged: ₹${expenseAmount.toFixed(2)} at ${expenseTitle} (${expenseCategory})`, 'success');
        loadExpenses();
      } else {
        // If confidence is low or merchant is unknown, show popup verification modal
        console.log('[DEBUG_FLOW] Low confidence (< 0.85). Opening prefilled verification modal.');
        const prefill = {
          title: expenseTitle === 'Unknown Merchant' ? '' : expenseTitle,
          amount: expenseAmount > 0 ? expenseAmount.toString() : '',
          category: expenseCategory,
          description: expenseDescription,
          date: expenseDate,
        };
        console.log('[DEBUG_FLOW] Setting prefilledData to:', prefill);
        setPrefilledData(prefill);
        setEditingExpense(null);
        setIsFormOpen(true);
        showToast('Receipt scanned. Please verify details before saving.', 'info');
      }
    } catch (err) {
      console.error('[DEBUG_FLOW] Error in handleReceiptParsed:', err);
      showToast('Error parsing receipt details. Opening verification form.', 'warning');
      const errPrefill = {
        title: classification?.title || parsedData?.merchant || '',
        amount: parsedData?.amount > 0 ? parsedData.amount.toString() : '',
        category: classification?.category || 'Others',
        description: `${classification?.description || ''}${parsedData?.items && parsedData.items.length > 0 ? ` (Items: ${parsedData.items.join(', ')})` : ''}`,
        date: parsedData?.date || new Date().toISOString().split('T')[0],
      };
      console.log('[DEBUG_FLOW] Setting prefilledData (fallback) to:', errPrefill);
      setPrefilledData(errPrefill);
      setEditingExpense(null);
      setIsFormOpen(true);
    } finally {
      setFormSubmitting(false);
      console.log('[DEBUG_FLOW] handleReceiptParsed finished execution');
    }
  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseApi.deleteExpense(id);
        showToast('Expense deleted successfully', 'success');
        
        // If current page is empty after deletion, adjust page number
        if (expenses.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          loadExpenses();
        }
      } catch (error) {
        console.error(error);
        showToast('Failed to delete expense', 'error');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-slide-in">
      
      {/* Title & Trigger Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Expenses
          </h1>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
            Manage, search, and filter all your expense logs
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setIsChoiceModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-primary-505 hover:bg-primary-600 text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-primary-505/20 hover:shadow-primary-600/30 transition-all hover:-translate-y-0.5 focus:outline-none h-[52px]"
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onClear={handleClearFilters}
      />

      {/* Expense List Table Card */}
      {loading ? (
        <Loader />
      ) : (
        <ExpenseTable
          expenses={expenses}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          page={page}
          pages={pages}
          onPageChange={setPage}
        />
      )}

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingExpense(null);
          setPrefilledData(null);
        }}
        onSubmit={handleCreateOrUpdateExpense}
        expense={editingExpense}
        prefilledData={prefilledData}
        loading={formSubmitting}
      />

      {/* Add Expense Choice Modal (Manual vs Scan) */}
      <AddExpenseChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onManualClick={() => {
          setEditingExpense(null);
          setPrefilledData(null);
          setIsFormOpen(true);
        }}
        onReceiptParsed={handleReceiptParsed}
      />

    </div>
  );
};

export default Expenses;
