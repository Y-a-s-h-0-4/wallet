'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';

interface Expense {
  id: string;
  amount: number;
  category: {
    id: string;
    name: string;
    icon?: string;
  };
  date: string;
}

interface ExpenseChartProps {
  expenses: Expense[];
}

export function ExpenseChart({ expenses }: ExpenseChartProps) {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  // Process expenses data for pie chart
  const pieData = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      const categoryName = expense.category.name;
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#10B981', '#8B5CF6', '#3B82F6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];
    
    return Object.entries(categoryTotals).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  }, [expenses]);

  // Process expenses data for bar chart (last 6 months)
  const barData = useMemo(() => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === date.getMonth() && 
               expenseDate.getFullYear() === date.getFullYear();
      });
      
      const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      months.push({
        month: monthName,
        expenses: totalExpenses,
        income: 8500 // Default income - you can make this dynamic later
      });
    }
    
    return months;
  }, [expenses]);

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <Button
          size="sm"
          variant={chartType === 'pie' ? 'default' : 'outline'}
          onClick={() => setChartType('pie')}
          className="text-xs"
        >
          Categories
        </Button>
        <Button
          size="sm"
          variant={chartType === 'bar' ? 'default' : 'outline'}
          onClick={() => setChartType('bar')}
          className="text-xs"
        >
          Trends
        </Button>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
            </PieChart>
          ) : (
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value) => [`₹${value}`, '']} />
              <Bar dataKey="income" fill="#10B981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="expenses" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {chartType === 'pie' && pieData.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {pieData.map((category, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: category.color }}
              />
              <span className="text-xs text-gray-600">{category.name}</span>
              <span className="text-xs font-medium">₹{category.value}</span>
            </div>
          ))}
        </div>
      )}

      {chartType === 'pie' && pieData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No expenses data available</p>
        </div>
      )}
    </div>
  );
}