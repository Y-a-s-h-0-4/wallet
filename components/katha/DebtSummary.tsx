'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Scale, TrendingUp } from 'lucide-react';

interface DebtSummaryProps {
  totalLent: number;
  totalBorrowed: number;
  netAmount: number;
  pendingCount: number;
}

export function DebtSummary({ totalLent, totalBorrowed, netAmount, pendingCount }: DebtSummaryProps) {
  const stats = [
    {
      title: 'You Lent',
      value: `₹${totalLent.toLocaleString()}`,
      icon: ArrowUpRight,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      count: pendingCount
    },
    {
      title: 'You Borrowed',
      value: `₹${totalBorrowed.toLocaleString()}`,
      icon: ArrowDownRight,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      count: pendingCount
    },
    {
      title: 'Net Balance',
      value: `₹${Math.abs(netAmount).toLocaleString()}`,
      icon: Scale,
      color: netAmount >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: netAmount >= 0 ? 'bg-green-50' : 'bg-red-50',
      subtitle: netAmount >= 0 ? 'You are owed' : 'You owe'
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
            {stat.count !== undefined ? (
              <p className="text-xs text-gray-500">{stat.count} pending</p>
            ) : (
              <p className={`text-xs ${stat.color} font-medium`}>{stat.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}