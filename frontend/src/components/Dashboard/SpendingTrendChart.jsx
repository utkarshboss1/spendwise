import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const SpendingTrendChart = ({ trendData = [] }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#475569';

  // Custom Tooltip component for premium styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-xl shadow-lg space-y-1">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500">{label}</p>
          {payload.map((item, idx) => (
            <p key={idx} className="text-sm font-extrabold" style={{ color: item.color }}>
              {item.name}: ₹{item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      {trendData.length === 0 ? (
        <div className="h-full flex items-center justify-center text-sm font-semibold text-gray-400 dark:text-gray-500">
          No monthly trend data available.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={trendData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {/* Income Gradient */}
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
              </linearGradient>
              {/* Expense Gradient */}
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            
            <XAxis
              dataKey="label"
              stroke={textColor}
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            
            <YAxis
              stroke={textColor}
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value}`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: '12px',
                fontWeight: '600',
                fontFamily: 'Inter',
                paddingBottom: '10px',
              }}
            />

            <Area
              type="monotone"
              name="Income"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#incomeGrad)"
            />

            <Area
              type="monotone"
              name="Expense"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#expenseGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SpendingTrendChart;
