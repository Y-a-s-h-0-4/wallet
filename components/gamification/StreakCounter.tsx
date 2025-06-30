'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Flame, Award } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
  streakDays?: boolean[]; // 7 days, true if active
}

export function StreakCounter({ streak, streakDays }: StreakCounterProps) {
  return (
    <Card className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 shadow-lg">
      <CardContent className="p-3">
        <div className="flex items-center space-x-2">
          <Flame className="w-5 h-5" />
          <div>
            <p className="text-xs font-medium opacity-90">Streak</p>
            <p className="text-lg font-bold">{streak} days</p>
            {streakDays && (
              <div className="flex space-x-1 mt-1 sm:space-x-1 sm:mt-1">
                {streakDays.map((active, i) => (
                  <div
                    key={i}
                    aria-label={`Day ${i + 1} ${active ? 'active' : 'inactive'}`}
                    className={`h-2 w-4 sm:w-6 rounded-full ${active ? 'bg-yellow-300' : 'bg-white/30'}`}
                    title={`Day ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}