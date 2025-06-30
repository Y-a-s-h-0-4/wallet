'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, Target, Flame, Award, CreditCard, PiggyBank, Users } from 'lucide-react';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { AddExpenseModal } from '@/components/expense/AddExpenseModal';
import { AddIncomeModal } from '@/components/expense/AddIncomeModal';
import { SubscriptionAlerts } from '@/components/subscription/SubscriptionAlerts';
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import { useTransactions } from '@/hooks/useExpenses';
import Link from 'next/link';
import { AddSavingsModal } from '@/components/expense/AddSavingsModal';
import { useSavings } from '@/hooks/useSavings';

function DashboardContent() {
  const { user } = useUser();
  const { expenses, incomes, loading, createTransaction, getTotalExpenses, getTotalIncomes, getTotalBalance } = useTransactions();
  const { savings, loading: savingsLoading, error: savingsError, refetch: refetchSavings } = useSavings();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddSavings, setShowAddSavings] = useState(false);

  // Calculate streak and streakDays
  const [streak, setStreak] = useState(0);
  const [streakDays, setStreakDays] = useState<boolean[]>([false, false, false, false, false, false, false]);

  // Dynamic greeting
  const [greeting, setGreeting] = useState('Good morning!');
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning!');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon!');
    } else {
      setGreeting('Good evening!');
    }
  }, []);

  useEffect(() => {
    // Gather all activity dates (expenses, incomes, savings)
    const activityDates = [
      ...expenses.map(e => e.date),
      ...incomes.map(i => i.date),
    ];
    // Build a set of YYYY-MM-DD (local) strings for activity
    const activitySet = new Set(
      activityDates.map(date => {
        const d = new Date(date);
        // Get local YYYY-MM-DD
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      })
    );
    // For the last 7 days (today is last)
    const days: boolean[] = [];
    let currentStreak = 0;
    let streakBroken = false;
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const active = activitySet.has(key);
      days.push(active);
      if (!streakBroken && active) {
        currentStreak++;
      } else {
        streakBroken = true;
      }
    }
    setStreak(currentStreak);
    setStreakDays(days);
  }, [expenses, incomes]);

  // Calculate current month's expenses and incomes
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const monthlyExpenses = getTotalExpenses(currentMonth, currentYear);
  const monthlyIncomes = getTotalIncomes(currentMonth, currentYear);
  const totalBalance = getTotalBalance(currentMonth, currentYear);

  // Calculate savings rate
  const savingsRate = monthlyIncomes > 0 ? ((monthlyIncomes - monthlyExpenses) / monthlyIncomes * 100).toFixed(1) : '0.0';

  const handleAddExpense = async (expense: any) => {
    const result = await createTransaction({ ...expense, type: 'EXPENSE' });
    if (result) setShowAddExpense(false);
  };

  const handleAddIncome = async (income: any) => {
    const result = await createTransaction({ ...income, type: 'INCOME' });
    if (result) setShowAddIncome(false);
  };

  const handleAddSavings = async (savings: any) => {
    setShowAddSavings(false);
    await refetchSavings();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{greeting} 👋</h1>
            <p className="text-gray-600">Let's manage your finances</p>
            <div className="mt-2">
              <StreakCounter streak={streak} streakDays={streakDays} />
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="mb-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Total Balance</p>
                <p className="text-3xl font-bold">₹{totalBalance.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm text-emerald-100">+{savingsRate}% this month</span>
                </div>
              </div>
              <div className="text-right">
                <PiggyBank className="w-8 h-8 mb-2 opacity-80" />
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => setShowAddExpense(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <QuickStats 
          monthlyIncome={monthlyIncomes}
          monthlyExpenses={monthlyExpenses}
          savingsRate={Number(savingsRate)}
          totalSavings={savings}
        />

        {/* Action Buttons (now above Upcoming Payments) */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button 
            size="sm"
            className="h-10 text-base bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            onClick={() => setShowAddExpense(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Expense
          </Button>
          <Button 
            size="sm"
            className="h-10 text-base bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            onClick={() => setShowAddIncome(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Income
          </Button>
        </div>
        <div className="mb-6">
          <Button 
            size="sm"
            className="h-10 text-base bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 w-full"
            onClick={() => setShowAddSavings(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Savings
          </Button>
        </div>

        {/* Subscription Alerts */}
        <SubscriptionAlerts />

        {/* Expense Chart */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-purple-600" />
              Spending Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseChart expenses={expenses} />
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <RecentTransactions expenses={expenses} />

        {/* Katha Button at the end */}
        <div className="mt-6">
          <Link href="/katha">
            <Button 
              variant="outline" 
              className="h-12 w-full border-2 border-blue-200 hover:bg-blue-50"
            >
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Katha
            </Button>
          </Link>
        </div>

        {/* Set Goal Button */}
        <Button 
          variant="outline" 
          className="w-full h-12 mt-4 border-2 border-emerald-200 hover:bg-emerald-50"
        >
          <Target className="w-5 h-5 mr-2 text-emerald-600" />
          Set Savings Goal
        </Button>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal 
        open={showAddExpense} 
        onClose={() => setShowAddExpense(false)}
        onSave={handleAddExpense}
      />
      <AddIncomeModal 
        open={showAddIncome} 
        onClose={() => setShowAddIncome(false)}
        onSave={handleAddIncome}
      />
      <AddSavingsModal 
        open={showAddSavings} 
        onClose={() => setShowAddSavings(false)}
        onSave={handleAddSavings}
      />
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <PiggyBank className="w-16 h-16 mx-auto text-emerald-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Wallet</h1>
          <p className="text-gray-600">Take control of your finances with intelligent expense tracking, budgeting, and savings goals.</p>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Sign in to access your dashboard</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <>
      <SignedIn>
        <DashboardContent />
      </SignedIn>
      <SignedOut>
        <WelcomeScreen />
      </SignedOut>
    </>
  );
}