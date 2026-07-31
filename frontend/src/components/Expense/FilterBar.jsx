import React from 'react';
import { Search, Filter, Calendar, RotateCcw } from 'lucide-react';

const FilterBar = ({
  search,
  setSearch,
  category,
  setCategory,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onClear,
}) => {
  const categories = ['Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Others'];

  return (
    <div className="w-full p-5 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title/desc..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-darkBorder bg-gray-50 dark:bg-darkBg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all"
          />
        </div>

        {/* Filters Group */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto md:min-w-[500px]">
          
          {/* Category Select */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-darkBorder bg-gray-50 dark:bg-darkBg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none">
              <Filter className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Start Date */}
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-darkBorder bg-gray-50 dark:bg-darkBg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all cursor-pointer"
              title="Start Date"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-darkBorder bg-gray-50 dark:bg-darkBg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all cursor-pointer"
              title="End Date"
            />
          </div>

        </div>

        {/* Clear Filters Button */}
        <button
          onClick={onClear}
          className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-transparent rounded-xl transition-all"
          title="Reset Filters"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="md:hidden lg:inline">Reset</span>
        </button>

      </div>
    </div>
  );
};

export default FilterBar;
