'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Debt {
  id: string;
  type: 'LENT' | 'BORROWED';
  person: string;
  amount: number;
  description: string;
  date: string;
  dueDate?: string;
  status: 'PENDING' | 'SETTLED';
  category: string;
}

interface DebtListProps {
  debts: Debt[];
  onSettle: (debtId: string) => void;
  onDelete: (debtId: string) => void;
}

export function DebtList({ debts, onSettle, onDelete }: DebtListProps) {
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      personal: '👤',
      food: '🍽️',
      transport: '🚗',
      entertainment: '🎬',
      shopping: '🛍️',
      bills: '💡',
      emergency: '🚨',
      other: '📦'
    };
    return icons[category] || '📦';
  };

  // Sort debts: pending first, then by date (newest first)
  const sortedDebts = [...debts].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'pending' ? -1 : 1;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-3">
      {sortedDebts.map((debt) => {
        const isOverdue = debt.dueDate && debt.status === 'pending' && getDaysUntilDue(debt.dueDate) < 0;
        const isDueSoon = debt.dueDate && debt.status === 'pending' && getDaysUntilDue(debt.dueDate) <= 3 && getDaysUntilDue(debt.dueDate) >= 0;
        
        return (
          <Card 
            key={debt.id} 
            className={`shadow-sm hover:shadow-md transition-all ${
              debt.status === 'settled' ? 'opacity-60' : ''
            } ${
              isOverdue ? 'border-l-4 border-l-red-500 bg-red-50' : 
              isDueSoon ? 'border-l-4 border-l-orange-400 bg-orange-50' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Category Icon */}
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                    {getCategoryIcon(debt.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Person and Type */}
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{debt.person}</p>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                        debt.type === 'LENT' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {debt.type === 'LENT' ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        <span>{debt.type === 'LENT' ? 'Lent' : 'Borrowed'}</span>
                      </div>
                    </div>
                    
                    {/* Description */}
                    {debt.description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{debt.description}</p>
                    )}
                    
                    {/* Date and Due Date */}
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>{format(new Date(debt.date), 'MMM dd, yyyy')}</span>
                      {debt.dueDate && debt.status === 'pending' && (
                        <div className={`flex items-center space-x-1 ${
                          isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-500'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          <span>
                            {isOverdue 
                              ? `Overdue by ${Math.abs(getDaysUntilDue(debt.dueDate))} days`
                              : isDueSoon
                              ? `Due in ${getDaysUntilDue(debt.dueDate)} days`
                              : `Due ${format(new Date(debt.dueDate), 'MMM dd')}`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Amount and Actions */}
                <div className="text-right ml-3">
                  <p className={`font-bold text-lg ${
                    debt.type === 'LENT' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ₹{debt.amount.toLocaleString()}
                  </p>
                  
                  {/* Status and Actions */}
                  <div className="flex items-center space-x-1 mt-2">
                    {debt.status === 'SETTLED' ? (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs">Settled</span>
                      </div>
                    ) : (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSettle(debt.id)}
                          className="h-7 px-2 text-xs text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Settle
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(debt.id)}
                          className="h-7 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}