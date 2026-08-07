import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const CategoryPieChart = ({ categoryData = [] }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#94a3b8' : '#475569';

  const categoryColors = {
    Food: '#f59e0b',          // Amber
    Shopping: '#ec4899',      // Pink
    Travel: '#3b82f6',        // Blue
    Bills: '#ef4444',         // Red
    Entertainment: '#8b5cf6', // Purple
    Healthcare: '#10b981',    // Emerald
    Education: '#06b6d4',     // Cyan
    Others: '#6b7280',        // Gray
  };

  const defaultColors = ['#f59e0b', '#ec4899', '#3b82f6', '#ef4444', '#8b5cf6', '#10b981', '#06b6d4', '#6b7280'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-xl shadow-lg">
          <p className="text-sm font-extrabold" style={{ color: payload[0].color }}>
            {data.category}: ₹{data.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 flex items-center justify-center">
      {categoryData.length === 0 ? (
        <div className="text-sm font-semibold text-gray-400 dark:text-gray-500">
          No spending data available. Add expenses to view.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={categoryColors[entry.category] || defaultColors[index % defaultColors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              layout="horizontal"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: '12px',
                fontWeight: '600',
                fontFamily: 'Inter',
                color: textColor,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CategoryPieChart;
