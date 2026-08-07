import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const DashboardStats = ({
  totalIncome = 0,
  totalExpense = 0,
  totalBalance = 0,
}) => {
  const isNegativeBalance = totalBalance < 0;

  const stats = [
    {
      title: 'Net Balance',
      value: `₹${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: isNegativeBalance 
        ? 'from-rose-500 to-pink-600 shadow-rose-500/10' 
        : 'from-primary-505 to-sky-600 shadow-primary-505/10',
      textColor: 'text-white',
    },
    {
      title: 'Total Income',
      value: `₹${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: ArrowUpRight,
      color: 'from-emerald-500 to-teal-600 shadow-emerald-500/10',
      textColor: 'text-white',
    },
    {
      title: 'Total Expense',
      value: `₹${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: ArrowDownRight,
      color: 'from-rose-500 to-red-600 shadow-rose-500/10',
      textColor: 'text-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${stat.color} shadow-lg transition-transform duration-200 hover:-translate-y-1`}
        >
          {/* Card background shape */}
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
            <stat.icon className="w-32 h-32" />
          </div>

          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-sm font-semibold opacity-85 uppercase tracking-wider">
                {stat.title}
              </span>
              <h3 className="text-3xl font-extrabold tracking-tight">
                {stat.value}
              </h3>
            </div>
            
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
