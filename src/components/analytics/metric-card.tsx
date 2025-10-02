'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalyticsUtils } from '@/lib/services/analytics';
import { MetricCardProps } from '@/types/analytics';

export function MetricCard({
  title,
  value,
  category,
  trend,
  unit,
  description,
}: MetricCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (unit === '%') {
        return AnalyticsUtils.formatPercentage(val);
      }
      if (unit === 'minutes') {
        return AnalyticsUtils.formatSleepDuration(val);
      }
      return val.toFixed(1);
    }
    return val;
  };

  const trendDisplay = trend ? AnalyticsUtils.getTrendDisplay(trend) : null;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {trendDisplay && (
            <div className={`flex items-center gap-1 ${trendDisplay.color}`}>
              <span className="text-lg">{trendDisplay.icon}</span>
              <span className="text-xs font-medium">{trendDisplay.text}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold">
              {formatValue(value)}
              {unit && unit !== 'minutes' && unit !== '%' && (
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {unit}
                </span>
              )}
            </div>
            
            {description && (
              <p className="text-xs text-muted-foreground mt-1 leading-tight">
                {description}
              </p>
            )}
          </div>
          
          {category && (
            <Badge 
              variant="secondary"
              className={`${AnalyticsUtils.getClinicalCategoryColor(category)} text-xs`}
            >
              {category}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricGrid({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {children}
    </div>
  );
}