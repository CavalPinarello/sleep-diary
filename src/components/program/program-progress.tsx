"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Target, 
  Trophy, 
  TrendingUp,
  AlertCircle,
  Plus,
  BarChart3
} from 'lucide-react';

interface ProgramProgressProps {
  program: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    targetDays: number;
    completedEntries: number;
    currentStreak: number;
    longestStreak: number;
  };
  entries: Array<{
    id: string;
    date: string;
    sleepEfficiency?: number;
    sleepQuality: number;
    totalSleepHours: number;
    totalSleepMins: number;
  }>;
  onNewEntry: () => void;
}

export function ProgramProgress({ program, entries, onNewEntry }: ProgramProgressProps) {
  const progressPercentage = (program.completedEntries / program.targetDays) * 100;
  const daysRemaining = program.targetDays - program.completedEntries;
  const averageSleepQuality = entries.length > 0 
    ? entries.reduce((sum, entry) => sum + entry.sleepQuality, 0) / entries.length
    : 0;

  // Generate calendar grid for visual progress
  const startDate = new Date(program.startDate);
  const today = new Date();
  const calendarDays = [];

  for (let i = 0; i < program.targetDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const dateStr = currentDate.toISOString().split('T')[0];
    const entry = entries.find(e => e.date.split('T')[0] === dateStr);
    const isPast = currentDate < today;
    const isToday = currentDate.toDateString() === today.toDateString();
    const isFuture = currentDate > today;

    calendarDays.push({
      date: currentDate,
      dateStr,
      dayNumber: i + 1,
      entry,
      isPast,
      isToday,
      isFuture,
      hasEntry: !!entry
    });
  }

  return (
    <div className="space-y-6">
      {/* Program Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{program.name}</CardTitle>
              <p className="text-muted-foreground mt-1">
                14-Day Stanford Sleep Health Assessment
              </p>
            </div>
            <div className="text-right">
              <div className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${program.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  program.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }
              `}>
                {program.status}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {program.completedEntries}
              </div>
              <div className="text-sm text-muted-foreground">Days Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(progressPercentage)}%
              </div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {program.currentStreak}
              </div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {daysRemaining}
              </div>
              <div className="text-sm text-muted-foreground">Days Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>14-Day Progress Calendar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Day', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(day => {
              const dayOfWeek = day.date.getDay(); // 0 = Sunday, 1 = Monday, etc.
              const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0 = Monday
              
              return (
                <React.Fragment key={day.dateStr}>
                  {/* Add day number in first column */}
                  <div className="text-center p-2 text-sm font-medium">
                    {day.dayNumber}
                  </div>
                  
                  {/* Empty cells for proper calendar alignment */}
                  {day.dayNumber === 1 && Array.from({ length: adjustedDayOfWeek }, (_, i) => (
                    <div key={`empty-${i}`} className="p-2"></div>
                  ))}
                  
                  <div className={`
                    relative p-3 rounded-lg border-2 text-center cursor-pointer transition-all
                    ${day.hasEntry 
                      ? 'border-green-500 bg-green-50' 
                      : day.isToday
                        ? 'border-blue-500 bg-blue-50'
                        : day.isPast
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                    }
                  `}>
                    <div className="text-xs text-muted-foreground">
                      {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    
                    {day.hasEntry ? (
                      <div className="mt-1">
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                        <div className="text-xs mt-1">
                          Quality: {day.entry?.sleepQuality}/5
                        </div>
                      </div>
                    ) : day.isToday ? (
                      <div className="mt-1">
                        <Clock className="w-5 h-5 text-blue-600 mx-auto" />
                        <div className="text-xs mt-1">Today</div>
                      </div>
                    ) : day.isPast ? (
                      <div className="mt-1">
                        <AlertCircle className="w-5 h-5 text-red-400 mx-auto" />
                        <div className="text-xs mt-1">Missed</div>
                      </div>
                    ) : (
                      <div className="mt-1">
                        <div className="w-5 h-5 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs mt-1">Future</div>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex items-center justify-center space-x-6 mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm">Missed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
              <span className="text-sm">Upcoming</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats & Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Sleep Quality Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {averageSleepQuality.toFixed(1)}/5
                </div>
                <div className="text-sm text-muted-foreground">Average Sleep Quality</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Last 3 days</span>
                  <span className="font-medium">
                    {entries.slice(-3).length > 0 
                      ? (entries.slice(-3).reduce((sum, e) => sum + e.sleepQuality, 0) / entries.slice(-3).length).toFixed(1)
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Best night</span>
                  <span className="font-medium text-green-600">
                    {entries.length > 0 ? Math.max(...entries.map(e => e.sleepQuality)) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total sleep hours</span>
                  <span className="font-medium">
                    {entries.length > 0 
                      ? Math.round(entries.reduce((sum, e) => sum + e.totalSleepHours + (e.totalSleepMins / 60), 0))
                      : 0
                    }h
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AchievementBadge
                title="First Entry"
                description="Completed your first sleep diary"
                achieved={program.completedEntries >= 1}
                icon={<Target className="w-4 h-4" />}
              />
              
              <AchievementBadge
                title="3-Day Streak"
                description="Three consecutive days of tracking"
                achieved={program.longestStreak >= 3}
                icon={<TrendingUp className="w-4 h-4" />}
              />
              
              <AchievementBadge
                title="Week Warrior"
                description="Completed 7 days of assessment"
                achieved={program.completedEntries >= 7}
                icon={<Calendar className="w-4 h-4" />}
              />
              
              <AchievementBadge
                title="Program Graduate"
                description="Finished the 14-day program"
                achieved={program.completedEntries >= 14}
                icon={<Trophy className="w-4 h-4" />}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={onNewEntry}
              className="flex-1"
              disabled={program.status !== 'ACTIVE'}
            >
              <Plus className="w-4 h-4 mr-2" />
              {entries.find(e => e.date.split('T')[0] === new Date().toISOString().split('T')[0])
                ? 'Update Today\'s Entry'
                : 'Add Today\'s Entry'
              }
            </Button>
            
            <Button variant="outline" className="flex-1">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Detailed Analytics
            </Button>
            
            {program.completedEntries >= 14 && (
              <Button variant="outline" className="flex-1">
                <Trophy className="w-4 h-4 mr-2" />
                Generate Clinical Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface AchievementBadgeProps {
  title: string;
  description: string;
  achieved: boolean;
  icon: React.ReactNode;
}

function AchievementBadge({ title, description, achieved, icon }: AchievementBadgeProps) {
  return (
    <div className={`
      flex items-center space-x-3 p-3 rounded-lg border transition-all
      ${achieved 
        ? 'border-yellow-300 bg-yellow-50' 
        : 'border-gray-200 bg-gray-50'
      }
    `}>
      <div className={`
        p-2 rounded-full
        ${achieved 
          ? 'bg-yellow-100 text-yellow-600' 
          : 'bg-gray-100 text-gray-400'
        }
      `}>
        {icon}
      </div>
      <div className="flex-1">
        <div className={`
          font-medium text-sm
          ${achieved ? 'text-yellow-800' : 'text-gray-500'}
        `}>
          {title}
        </div>
        <div className={`
          text-xs
          ${achieved ? 'text-yellow-700' : 'text-gray-400'}
        `}>
          {description}
        </div>
      </div>
      {achieved && (
        <CheckCircle className="w-5 h-5 text-yellow-600" />
      )}
    </div>
  );
}