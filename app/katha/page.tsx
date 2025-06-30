'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Plus, ArrowUpRight, ArrowDownRight, Users, Clock, CheckCircle } from 'lucide-react';
import { AddDebtModal } from '@/components/katha/AddDebtModal';
import { DebtList } from '@/components/katha/DebtList';
import { DebtSummary } from '@/components/katha/DebtSummary';
import { useDebts } from '@/hooks/useDebts';

export default function KathaPage() {
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [filter, setFilter] = useState<'all' | 'LENT' | 'BORROWED'>('all');
  const { debts, loading, createDebt, settleDebt, deleteDebt, getDebtSummary } = useDebts();

  const handleAddDebt = async (newDebt: any) => {
    const result = await createDebt({
      type: newDebt.type,
      person: newDebt.person,
      amount: newDebt.amount,
      description: newDebt.description,
      dueDate: newDebt.dueDate,
      category: newDebt.category,
    });

    if (result) {
      setShowAddDebt(false);
    }
  };

  const handleSettleDebt = async (debtId: string) => {
    await settleDebt(debtId);
  };

  const handleDeleteDebt = async (debtId: string) => {
    await deleteDebt(debtId);
  };

  const filteredDebts = debts.filter(debt => {
    if (filter === 'all') return true;
    return debt.type === filter;
  });

  const debtSummary = getDebtSummary();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your debts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                Katha
              </h1>
              <p className="text-gray-600">Track your debts & credits</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddDebt(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {/* Summary Cards */}
        <DebtSummary 
          totalLent={debtSummary.totalLent}
          totalBorrowed={debtSummary.totalBorrowed}
          netAmount={debtSummary.netAmount}
          pendingCount={debtSummary.pendingCount}
        />

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="flex-1"
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === 'LENT' ? 'default' : 'outline'}
            onClick={() => setFilter('LENT')}
            className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
          >
            <ArrowUpRight className="w-4 h-4 mr-1" />
            Lent
          </Button>
          <Button
            size="sm"
            variant={filter === 'BORROWED' ? 'default' : 'outline'}
            onClick={() => setFilter('BORROWED')}
            className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
          >
            <ArrowDownRight className="w-4 h-4 mr-1" />
            Borrowed
          </Button>
        </div>

        {/* Debt List */}
        <DebtList
          debts={filteredDebts}
          onSettle={handleSettleDebt}
          onDelete={handleDeleteDebt}
        />

        {/* Empty State */}
        {filteredDebts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No debts found</h3>
              <p className="text-gray-500 mb-4">
                {filter === 'all' 
                  ? "You don't have any debts or credits yet."
                  : `No ${filter.toLowerCase()} transactions found.`}
              </p>
              <Button
                onClick={() => setShowAddDebt(true)}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Entry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add Debt Modal */}
        <AddDebtModal
          open={showAddDebt}
          onClose={() => setShowAddDebt(false)}
          onSave={handleAddDebt}
        />
      </div>
    </div>
  );
}