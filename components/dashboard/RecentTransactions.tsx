'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Expense {
  id: string;
  amount: number;
  description?: string;
  merchant?: string;
  date: string;
  category: {
    id: string;
    name: string;
    icon?: string;
  };
}

interface RecentTransactionsProps {
  expenses: Expense[];
}

export function RecentTransactions({ expenses }: RecentTransactionsProps) {
  // Get recent expenses (last 5)
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {recentExpenses.length > 0 ? (
            recentExpenses.map((expense, index) => (
              <div 
                key={expense.id} 
                className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  index !== recentExpenses.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {expense.description || expense.category.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {expense.merchant || expense.category.name} • {formatTimeAgo(expense.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">
                    -₹{expense.amount}
                  </p>
                  <p className="text-xs text-gray-500">{expense.category.name}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-500">
                Start adding expenses to see your recent transactions here.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}