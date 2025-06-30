'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, Percent } from 'lucide-react';

interface QuickStatsProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  totalSavings: number;
}

export function QuickStats({ monthlyIncome, monthlyExpenses, savingsRate, totalSavings }: QuickStatsProps) {
  // const savings = monthlyIncome - monthlyExpenses;

  const stats = [
    {
      title: 'Income',
      value: `₹${monthlyIncome.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: '+12%'
    },
    {
      title: 'Expenses',
      value: `₹${monthlyExpenses.toLocaleString()}`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: '-8%'
    },
    {
      title: 'Savings',
      value: `₹${totalSavings.toLocaleString()}`,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: `${savingsRate}%`
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className={`w-8 h-8 rounded-full ${stat.bgColor} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-xs text-gray-600 mb-1">{stat.title}</p>
            <p className="text-sm font-bold text-gray-900">{stat.value}</p>
            <p className={`text-xs ${stat.color} font-medium`}>{stat.trend}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}