'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Heart, 
  AlertTriangle, 
  Target, 
  Loader2, 
  RefreshCw,
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react';

import { AnalyticsService } from '@/lib/services/analytics';
import { Analytics, AnalyticsRequest } from '@/types/analytics';

import { SleepMetricsDisplay, SleepMetricsSummary } from './sleep-metrics';
import { WellnessTrackingDisplay, WellnessSummaryCard } from './wellness-tracking';
import { ClinicalInsightsPanel, ClinicalSummaryCard } from './clinical-insights';
import { RecommendationsPanel, RecommendationsSummaryCard } from './recommendations';

interface AnalyticsDashboardProps {
  programId?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  className?: string;
}

export function AnalyticsDashboard({ 
  programId, 
  dateRange,
  className = '' 
}: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataPoints, setDataPoints] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const params: AnalyticsRequest = {
        includeCorrelations: true,
        includeTrends: true,
        includeRecommendations: true,
      };

      if (programId) {
        params.programId = programId;
      }

      if (dateRange) {
        params.dateFrom = dateRange.from;
        params.dateTo = dateRange.to;
      }

      const response = await AnalyticsService.getAnalytics(params);
      
      if (response.success && response.analytics) {
        setAnalytics(response.analytics);
        setDataPoints(response.dataPoints);
      } else {
        setAnalytics(null);
        setDataPoints(0);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [programId, dateRange?.from, dateRange?.to]);

  const handleRefresh = () => {
    loadAnalytics(true);
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium">Analyzing Your Sleep Data</h3>
                <p className="text-muted-foreground">
                  Generating personalized insights and recommendations...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadAnalytics()}
                className="ml-4"
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!analytics || dataPoints === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium">No Sleep Data Available</h3>
                <p className="text-muted-foreground">
                  Start tracking your sleep to see personalized analytics and insights.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sleep Analytics</h2>
          <p className="text-muted-foreground">
            Insights based on {dataPoints} sleep entries
            {analytics.generatedAt && (
              <span className="ml-2 text-xs">
                • Updated {new Date(analytics.generatedAt).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analytics.sleepMetrics && (
          <SleepMetricsSummary metrics={analytics.sleepMetrics} />
        )}
        
        {analytics.wellnessAnalysis && (
          <WellnessSummaryCard wellness={analytics.wellnessAnalysis} />
        )}
        
        <ClinicalSummaryCard insights={analytics.clinicalInsights} />
        
        {analytics.recommendations && (
          <RecommendationsSummaryCard recommendations={analytics.recommendations} />
        )}
      </div>

      {/* Main Analytics Content */}
      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Sleep Metrics
          </TabsTrigger>
          
          <TabsTrigger value="wellness" className="gap-2">
            <Heart className="h-4 w-4" />
            Wellness
          </TabsTrigger>
          
          <TabsTrigger value="clinical" className="gap-2">
            <Activity className="h-4 w-4" />
            Clinical
          </TabsTrigger>
          
          <TabsTrigger value="recommendations" className="gap-2">
            <Target className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          {analytics.sleepMetrics && (
            <SleepMetricsDisplay 
              metrics={analytics.sleepMetrics} 
              qualityPatterns={analytics.qualityPatterns}
            />
          )}
        </TabsContent>

        <TabsContent value="wellness" className="space-y-6">
          {analytics.wellnessAnalysis ? (
            <WellnessTrackingDisplay 
              wellness={analytics.wellnessAnalysis}
              correlations={analytics.correlations}
            />
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-2">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-medium">No Wellness Data</h3>
                  <p className="text-muted-foreground">
                    Enable wellness tracking in your sleep entries to see correlations and trends.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="clinical" className="space-y-6">
          <ClinicalInsightsPanel insights={analytics.clinicalInsights} />
          
          {/* Trends Section */}
          {analytics.trends && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Sleep Trends Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Sleep Quality</div>
                    <div className="text-lg font-bold mb-2">
                      {analytics.trends.sleepQuality.trend === 'improving' && '↗'}
                      {analytics.trends.sleepQuality.trend === 'declining' && '↘'}
                      {analytics.trends.sleepQuality.trend === 'stable' && '→'}
                      <span className="ml-2">
                        {analytics.trends.sleepQuality.trend.charAt(0).toUpperCase() + 
                         analytics.trends.sleepQuality.trend.slice(1)}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {analytics.trends.sleepQuality.changeRate > 0 ? '+' : ''}
                      {analytics.trends.sleepQuality.changeRate.toFixed(1)}% change
                    </Badge>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Sleep Efficiency</div>
                    <div className="text-lg font-bold mb-2">
                      {analytics.trends.sleepEfficiency.trend === 'improving' && '↗'}
                      {analytics.trends.sleepEfficiency.trend === 'declining' && '↘'}
                      {analytics.trends.sleepEfficiency.trend === 'stable' && '→'}
                      <span className="ml-2">
                        {analytics.trends.sleepEfficiency.trend.charAt(0).toUpperCase() + 
                         analytics.trends.sleepEfficiency.trend.slice(1)}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {analytics.trends.sleepEfficiency.changeRate > 0 ? '+' : ''}
                      {analytics.trends.sleepEfficiency.changeRate.toFixed(1)}% change
                    </Badge>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Overall Trend</div>
                    <div className="text-lg font-bold mb-2">
                      {analytics.trends.overall === 'improving' && '↗'}
                      {analytics.trends.overall === 'declining' && '↘'}
                      {analytics.trends.overall === 'stable' && '→'}
                      <span className="ml-2">
                        {analytics.trends.overall.charAt(0).toUpperCase() + 
                         analytics.trends.overall.slice(1)}
                      </span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        analytics.trends.overall === 'improving' ? 'bg-green-100 text-green-700' :
                        analytics.trends.overall === 'declining' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}
                    >
                      Sleep Pattern
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {analytics.recommendations && (
            <RecommendationsPanel recommendations={analytics.recommendations} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function AnalyticsSummary({ 
  programId,
  dateRange,
  className = '' 
}: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const params: AnalyticsRequest = { 
          includeCorrelations: false, 
          includeTrends: false, 
          includeRecommendations: false 
        };
        
        if (programId) params.programId = programId;
        if (dateRange) {
          params.dateFrom = dateRange.from;
          params.dateTo = dateRange.to;
        }

        const response = await AnalyticsService.getAnalytics(params);
        setAnalytics(response.analytics);
      } catch (error) {
        console.error('Failed to load analytics summary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, [programId, dateRange?.from, dateRange?.to]);

  if (isLoading) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {analytics.sleepMetrics && (
        <SleepMetricsSummary metrics={analytics.sleepMetrics} />
      )}
      
      {analytics.wellnessAnalysis && (
        <WellnessSummaryCard wellness={analytics.wellnessAnalysis} />
      )}
    </div>
  );
}