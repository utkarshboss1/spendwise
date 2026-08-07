import React, { useEffect, useState, useCallback } from 'react';
import incomeApi from '../api/incomeApi';
import IncomeTable from '../components/Income/IncomeTable';
import IncomeForm from '../components/Income/IncomeForm';
import Loader from '../components/Common/Loader';
import { useToast } from '../context/ToastContext';
import { Plus, Search, Calendar, RefreshCw } from 'lucide-react';

const Income = () => {
  const { showToast } = useToast();

  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState('newest');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadIncomes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await incomeApi.getIncomes({
        search,
        startDate,
        endDate,
        sort,
        page,
        limit: 10,
      });
      setIncomes(data.incomes);
      setPages(data.pages);
    } catch (error) {
      console.error(error);
      showToast('Failed to load incomes list', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, startDate, endDate, sort, page]);

  useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate, sort]);

  useEffect(() => {
    loadIncomes();
  }, [loadIncomes]);

  const handleClearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setSort('newest');
    setPage(1);
  };

  const handleCreateOrUpdateIncome = async (incomeData) => {
    try {
      setFormSubmitting(true);
      if (editingIncome) {
        // Edit Mode
        await incomeApi.updateIncome(editingIncome._id, incomeData);
        showToast('Income updated successfully', 'success');
      } else {
        // Add Mode
        await incomeApi.createIncome(incomeData);
        showToast('Income added successfully', 'success');
      }
      setIsFormOpen(false);
      setEditingIncome(null);
      loadIncomes();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Failed to save income', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditClick = (income) => {
    setEditingIncome(income);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        await incomeApi.deleteIncome(id);
        showToast('Income deleted successfully', 'success');
        
        if (incomes.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          loadIncomes();
        }
      } catch (error) {
        console.error(error);
        showToast('Failed to delete income', 'error');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-slide-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Incomes
          </h1>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
            Track and manage your salary and other revenue sources
          </p>
        </div>
        
        <button
          onClick={() => {
            setEditingIncome(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-505 hover:bg-primary-600 text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-primary-505/20 hover:shadow-primary-600/30 transition-all hover:-translate-y-0.5 focus:outline-none"
        >
          <Plus className="w-5 h-5" />
          Add Income
        </button>
      </div>

      {/* Inline Filters */}
      <div className="p-4 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl shadow-sm flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Start Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
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
              placeholder="End Date"
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

        {/* Clear Filters Button */}
        {(search || startDate || endDate || sort !== 'newest') && (
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

      {/* Table */}
      {loading ? (
        <Loader />
      ) : (
        <IncomeTable
          incomes={incomes}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          page={page}
          pages={pages}
          onPageChange={setPage}
        />
      )}

      {/* Form Modal */}
      <IncomeForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingIncome(null);
        }}
        onSubmit={handleCreateOrUpdateIncome}
        income={editingIncome}
        loading={formSubmitting}
      />

    </div>
  );
};

export default Income;
