'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SleepMetrics, QualityPatterns, DayOfWeekAnalysis } from '@/types/analytics';
import { AnalyticsUtils } from '@/lib/services/analytics';
import { MetricCard, MetricGrid } from './metric-card';

interface SleepMetricsDisplayProps {
  metrics: SleepMetrics;
  qualityPatterns: QualityPatterns;
}

export function SleepMetricsDisplay({ metrics, qualityPatterns }: SleepMetricsDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Primary Metrics Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Sleep Metrics Overview</h3>
        <MetricGrid>
          <MetricCard
            title="Average Sleep Duration"
            value={metrics.totalSleep.average}
            unit="minutes"
            category={getConsistencyCategory(metrics.totalSleep.consistency)}
            description={`Range: ${AnalyticsUtils.formatSleepDuration(metrics.totalSleep.range.min)} - ${AnalyticsUtils.formatSleepDuration(metrics.totalSleep.range.max)}`}
          />
          
          <MetricCard
            title="Sleep Efficiency"
            value={metrics.sleepEfficiency.average}
            unit="%"
            category={metrics.sleepEfficiency.clinicalCategory}
            description={`Median: ${AnalyticsUtils.formatPercentage(metrics.sleepEfficiency.median)}`}
          />
          
          <MetricCard
            title="Sleep Latency"
            value={metrics.sleepLatency.average}
            unit="minutes"
            category={metrics.sleepLatency.clinicalCategory}
            description={`Time to fall asleep`}
          />
          
          <MetricCard
            title="Night Awakenings"
            value={metrics.nightAwakenings.average}
            unit="times"
            description={`Range: ${metrics.nightAwakenings.range.min} - ${metrics.nightAwakenings.range.max}`}
          />
        </MetricGrid>
      </div>

      {/* Sleep Quality Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Sleep Quality Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quality Distribution */}
            <div>
              <h4 className="font-medium mb-3">Quality Rating Distribution</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = metrics.sleepQuality.distribution[rating] || 0;
                  const percentage = count > 0 ? (count / Object.values(metrics.sleepQuality.distribution).reduce((a, b) => a + b, 0)) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 min-w-[60px]">
                        <Badge variant={rating >= 4 ? 'default' : rating >= 3 ? 'secondary' : 'destructive'} className="text-xs">
                          {rating}/5
                        </Badge>
                      </div>
                      <Progress value={percentage} className="flex-1" />
                      <span className="text-sm text-muted-foreground min-w-[40px] text-right">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-sm">
                  <strong>Average Quality:</strong> {metrics.sleepQuality.average.toFixed(1)}/5
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>Median:</strong> {metrics.sleepQuality.median}/5
                </div>
              </div>
            </div>

            {/* Quality Stability */}
            <div>
              <h4 className="font-medium mb-3">Quality Consistency</h4>
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <div className="text-3xl font-bold mb-2">
                  {AnalyticsUtils.formatPercentage(qualityPatterns.qualityStability.score)}
                </div>
                <Badge 
                  variant="secondary"
                  className={`${getStabilityColor(qualityPatterns.qualityStability.category)} mb-2`}
                >
                  {qualityPatterns.qualityStability.category}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Sleep quality consistency rating
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day of Week Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Sleep Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Days */}
            <div>
              <h4 className="font-medium mb-3 text-green-600">Best Sleep Days</h4>
              <div className="space-y-2">
                {qualityPatterns.bestDays.map((day, index) => (
                  <DayQualityItem key={day.day} day={day} rank={index + 1} variant="success" />
                ))}
              </div>
            </div>

            {/* Challenging Days */}
            <div>
              <h4 className="font-medium mb-3 text-orange-600">Days for Improvement</h4>
              <div className="space-y-2">
                {qualityPatterns.worstDays.map((day, index) => (
                  <DayQualityItem key={day.day} day={day} rank={index + 1} variant="warning" />
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Overview */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-3">Complete Week Overview</h4>
            <div className="grid grid-cols-7 gap-2">
              {AnalyticsUtils.sortDaysOfWeek(qualityPatterns.dayOfWeekAnalysis).map(day => (
                <div key={day.day} className="text-center p-2 rounded-lg bg-muted/50">
                  <div className="text-xs font-medium mb-1">
                    {AnalyticsUtils.getDayAbbreviation(day.day)}
                  </div>
                  <div className="text-sm font-bold">
                    {day.average.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ({day.count} nights)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DayQualityItem({ 
  day, 
  rank, 
  variant 
}: { 
  day: DayOfWeekAnalysis; 
  rank: number; 
  variant: 'success' | 'warning' | 'info' 
}) {
  const variantStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${variantStyles[variant]}`}>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-xs w-6 h-6 flex items-center justify-center p-0">
          {rank}
        </Badge>
        <span className="font-medium">{day.day}</span>
      </div>
      <div className="text-right">
        <div className="font-bold">{day.average.toFixed(1)}/5</div>
        <div className="text-xs opacity-70">{day.count} nights</div>
      </div>
    </div>
  );
}

function getConsistencyCategory(consistency?: number): string {
  if (!consistency) return 'Unknown';
  if (consistency >= 80) return 'Excellent';
  if (consistency >= 60) return 'Good';
  if (consistency >= 40) return 'Fair';
  return 'Variable';
}

function getStabilityColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'very stable':
      return 'text-green-700 bg-green-100';
    case 'stable':
      return 'text-green-600 bg-green-50';
    case 'somewhat variable':
      return 'text-yellow-600 bg-yellow-50';
    case 'highly variable':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function SleepMetricsSummary({ metrics }: { metrics: SleepMetrics }) {
  const efficiencyCategory = metrics.sleepEfficiency.clinicalCategory || 'Unknown';
  const latencyCategory = metrics.sleepLatency.clinicalCategory || 'Unknown';
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {AnalyticsUtils.formatPercentage(metrics.sleepEfficiency.average)}
            </div>
            <div className="text-sm text-muted-foreground">Sleep Efficiency</div>
            <Badge 
              variant="secondary" 
              className={`${AnalyticsUtils.getClinicalCategoryColor(efficiencyCategory)} text-xs mt-1`}
            >
              {efficiencyCategory}
            </Badge>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.sleepQuality.average.toFixed(1)}/5
            </div>
            <div className="text-sm text-muted-foreground">Avg Quality</div>
            <Badge 
              variant="secondary" 
              className={`${AnalyticsUtils.getClinicalCategoryColor(latencyCategory)} text-xs mt-1`}
            >
              {latencyCategory} Latency
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}