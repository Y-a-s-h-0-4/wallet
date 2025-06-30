'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, CreditCard, AlertTriangle } from 'lucide-react';

const upcomingPayments = [
  {
    id: 1,
    name: 'Netflix',
    amount: 199,
    dueDate: '2025-01-15',
    type: 'subscription',
    logo: '🎬'
  },
  {
    id: 2,
    name: 'Spotify',
    amount: 119,
    dueDate: '2025-01-18',
    type: 'subscription',
    logo: '🎵'
  },
  {
    id: 3,
    name: 'Credit Card',
    amount: 2500,
    dueDate: '2025-01-20',
    type: 'bill',
    logo: '💳'
  }
];

export function SubscriptionAlerts() {
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card className="mb-6 shadow-sm border-l-4 border-l-orange-400">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Bell className="w-5 h-5 mr-2 text-orange-600" />
          Upcoming Payments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingPayments.map((payment) => {
          const daysUntil = getDaysUntilDue(payment.dueDate);
          const isUrgent = daysUntil <= 3;
          
          return (
            <div 
              key={payment.id} 
              className={`flex items-center justify-between p-3 rounded-lg border ${
                isUrgent ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center text-lg">
                  {payment.logo}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{payment.name}</p>
                  <p className="text-xs text-gray-500">
                    {daysUntil === 0 ? 'Due today' : 
                     daysUntil === 1 ? 'Due tomorrow' : 
                     `Due in ${daysUntil} days`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">₹{payment.amount}</p>
                {isUrgent && (
                  <AlertTriangle className="w-4 h-4 text-red-500 ml-auto" />
                )}
              </div>
            </div>
          );
        })}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3 text-orange-600 border-orange-200 hover:bg-orange-50"
        >
          <Calendar className="w-4 h-4 mr-2" />
          View All Subscriptions
        </Button>
      </CardContent>
    </Card>
  );
}