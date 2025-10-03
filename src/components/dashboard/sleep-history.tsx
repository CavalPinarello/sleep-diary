'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Moon, Sun, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface ClinicalEntry {
  id: string;
  date: string;
  sleepQuality: number;
  sleepEfficiency: number | null;
  totalSleepHours: number;
  totalSleepMins: number;
  createdAt?: string;
  updatedAt?: string;
}

export function SleepHistory() {
  const [entries, setEntries] = useState<ClinicalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEntries() {
      try {
        const response = await fetch('/api/clinical-entries?limit=10');
        if (response.ok) {
          const data = await response.json();
          setEntries(data.entries || []);
        }
      } catch (error) {
        console.error('Failed to fetch entries:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEntries();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4" />
        <p>No sleep history available</p>
        <p className="text-sm">Start logging your sleep to build your history</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const totalMinutes = entry.totalSleepHours * 60 + entry.totalSleepMins;
        const hours = Math.floor(totalMinutes / 60);
        const mins = Math.round(totalMinutes % 60);

        return (
          <Card key={entry.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary/10 rounded-lg">
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(entry.date), 'MMM')}
                    </div>
                    <div className="text-2xl font-bold">
                      {format(new Date(entry.date), 'd')}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 text-sm text-muted-foreground">
                      {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {hours}h {mins}m
                      </span>

                      {entry.sleepEfficiency !== null && (
                        <Badge
                          variant={entry.sleepEfficiency >= 85 ? 'default' : entry.sleepEfficiency >= 80 ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {entry.sleepEfficiency.toFixed(0)}% efficiency
                        </Badge>
                      )}

                      <Badge
                        variant={entry.sleepQuality >= 4 ? 'default' : entry.sleepQuality >= 3 ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        Quality: {entry.sleepQuality}/5
                      </Badge>
                    </div>
                  </div>
                </div>

                <button className="text-muted-foreground hover:text-foreground">
                  <TrendingUp className="h-5 w-5" />
                </button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
