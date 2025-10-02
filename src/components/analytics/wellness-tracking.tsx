'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sun, 
  Zap, 
  Target, 
  Smile, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Info
} from 'lucide-react';
import { WellnessAnalysis, Correlations, WellnessMetric } from '@/types/analytics';
import { AnalyticsUtils } from '@/lib/services/analytics';
import { MetricCard, MetricGrid } from './metric-card';

interface WellnessTrackingProps {
  wellness: WellnessAnalysis;
  correlations?: Correlations | null;
}

const WELLNESS_METRICS = {
  morningAlertness: {
    title: 'Morning Alertness',
    icon: Sun,
    description: 'How alert you feel upon waking',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  daytimeEnergy: {
    title: 'Daytime Energy',
    icon: Zap,
    description: 'Energy levels throughout the day',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  daytimeFocus: {
    title: 'Daytime Focus',
    icon: Target,
    description: 'Ability to concentrate during the day',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  daytimeMood: {
    title: 'Daytime Mood',
    icon: Smile,
    description: 'Overall mood and emotional state',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
} as const;

export function WellnessTrackingDisplay({ wellness, correlations }: WellnessTrackingProps) {
  const hasWellnessData = Object.values(WELLNESS_METRICS).some(
    metric => wellness[metric.title.toLowerCase().replace(' ', '') as keyof WellnessAnalysis]
  );

  if (!hasWellnessData) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <Info className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">No Wellness Data Yet</h3>
              <p className="text-muted-foreground">
                Start tracking morning alertness and daytime wellness to see insights here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wellness Metrics Overview */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Wellness Metrics Overview</h3>
        <MetricGrid>
          {Object.entries(WELLNESS_METRICS).map(([key, config]) => {
            const metric = wellness[key as keyof WellnessAnalysis] as WellnessMetric | null;
            
            if (!metric) return null;

            return (
              <MetricCard
                key={key}
                title={config.title}
                value={metric.average.toFixed(1)}
                unit="/5"
                category={metric.category}
                trend={metric.trend}
                description={`Consistency: ${AnalyticsUtils.formatPercentage(metric.consistency)}`}
              />
            );
          })}
        </MetricGrid>
      </div>

      {/* Detailed Wellness Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Wellness Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(WELLNESS_METRICS).map(([key, config]) => {
              const metric = wellness[key as keyof WellnessAnalysis] as WellnessMetric | null;
              
              if (!metric) return null;

              const Icon = config.icon;
              const trendDisplay = AnalyticsUtils.getTrendDisplay(metric.trend);

              return (
                <div key={key} className={`p-4 rounded-lg border ${config.bgColor} border-opacity-50`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${config.color}`} />
                      <h4 className="font-medium">{config.title}</h4>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={AnalyticsUtils.getClinicalCategoryColor(metric.category)}>
                        {metric.category}
                      </Badge>
                      
                      <div className={`flex items-center gap-1 ${trendDisplay.color} text-sm`}>
                        <span>{trendDisplay.icon}</span>
                        <span className="font-medium">{trendDisplay.text}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Average Score</div>
                      <div className="text-2xl font-bold">{metric.average.toFixed(1)}/5</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Consistency</div>
                      <div className="flex items-center gap-2">
                        <Progress value={metric.consistency} className="flex-1" />
                        <span className="text-sm font-medium">
                          {AnalyticsUtils.formatPercentage(metric.consistency)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Trend Category</div>
                      <div className="text-sm font-medium">{config.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Overall Wellness Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Wellness Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">
                {wellness.overallTrends.improving}
              </div>
              <div className="text-sm text-green-600">Improving Metrics</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-700">
                {wellness.overallTrends.declining}
              </div>
              <div className="text-sm text-red-600">Declining Metrics</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Minus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">
                {wellness.overallTrends.stable}
              </div>
              <div className="text-sm text-blue-600">Stable Metrics</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tracking Completion:</span>
              <div className="flex items-center gap-2">
                <Progress value={wellness.trackingCompletion} className="w-24" />
                <span className="text-sm font-medium">
                  {AnalyticsUtils.formatPercentage(wellness.trackingCompletion)}
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Percentage of sleep entries that include wellness tracking data
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sleep-Wellness Correlations */}
      {correlations?.wellness && (
        <Card>
          <CardHeader>
            <CardTitle>Sleep Quality Correlations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                How your sleep quality relates to next-day wellness metrics:
              </p>

              {Object.entries(correlations.wellness).map(([key, correlation]) => {
                const metricName = key.replace('sleepQualityVs', '').replace(/([A-Z])/g, ' $1').trim();
                const strength = Math.abs(correlation);
                const direction = correlation >= 0 ? 'positive' : 'negative';
                
                return (
                  <Alert key={key} className="border-blue-200 bg-blue-50">
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          Sleep Quality → {metricName}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={`${
                            strength >= 0.7 ? 'bg-green-100 text-green-700' :
                            strength >= 0.4 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {AnalyticsUtils.formatCorrelation(correlation)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {strength >= 0.4 
                          ? `${direction === 'positive' ? 'Better' : 'Poorer'} sleep quality is associated with ${direction === 'positive' ? 'higher' : 'lower'} ${metricName.toLowerCase()}`
                          : 'Weak or no clear relationship detected'
                        }
                      </div>
                    </AlertDescription>
                  </Alert>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function WellnessSummaryCard({ wellness }: { wellness: WellnessAnalysis }) {
  const metrics = [
    wellness.morningAlertness,
    wellness.daytimeEnergy,
    wellness.daytimeFocus,
    wellness.daytimeMood,
  ].filter(Boolean) as WellnessMetric[];

  if (metrics.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Info className="h-8 w-8 text-muted-foreground mx-auto" />
            <div className="text-sm text-muted-foreground">
              No wellness data available
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const avgScore = metrics.reduce((sum, metric) => sum + metric.average, 0) / metrics.length;
  const improvingCount = wellness.overallTrends.improving;
  const totalTrends = wellness.overallTrends.improving + wellness.overallTrends.declining + wellness.overallTrends.stable;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {avgScore.toFixed(1)}/5
            </div>
            <div className="text-sm text-muted-foreground">Avg Wellness</div>
            <Badge variant="secondary" className="text-xs mt-1">
              {metrics.length} metric{metrics.length !== 1 ? 's' : ''} tracked
            </Badge>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalTrends > 0 ? Math.round((improvingCount / totalTrends) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Improving</div>
            <Badge variant="secondary" className="text-xs mt-1">
              {AnalyticsUtils.formatPercentage(wellness.trackingCompletion)} Complete
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}