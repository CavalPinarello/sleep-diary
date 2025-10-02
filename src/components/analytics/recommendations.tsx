'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Heart, 
  Stethoscope, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  ChevronRight
} from 'lucide-react';
import { Recommendations } from '@/types/analytics';
import { AnalyticsUtils } from '@/lib/services/analytics';
import { useState } from 'react';

interface RecommendationsProps {
  recommendations: Recommendations;
}

const RECOMMENDATION_TYPES = {
  immediate: {
    title: 'Immediate Actions',
    icon: Clock,
    description: 'Quick steps you can take today to improve your sleep',
    priority: 'HIGH',
  },
  lifestyle: {
    title: 'Lifestyle Changes',
    icon: Heart,
    description: 'Long-term habits that will enhance your sleep quality',
    priority: 'MEDIUM',
  },
  clinical: {
    title: 'Clinical Considerations',
    icon: Stethoscope,
    description: 'Professional evaluation and medical guidance recommended',
    priority: 'HIGH',
  },
} as const;

export function RecommendationsPanel({ recommendations }: RecommendationsProps) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const toggleCompleted = (recommendation: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(recommendation)) {
      newCompleted.delete(recommendation);
    } else {
      newCompleted.add(recommendation);
    }
    setCompletedItems(newCompleted);
  };

  const totalRecommendations = 
    recommendations.immediate.length + 
    recommendations.lifestyle.length + 
    recommendations.clinical.length;

  if (totalRecommendations === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-2">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-medium">Great Job!</h3>
            <p className="text-muted-foreground">
              Your sleep patterns are looking good. No specific recommendations at this time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Personalized Recommendations</h2>
          <p className="text-sm text-muted-foreground">
            Based on your sleep patterns, here are suggested improvements
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {totalRecommendations} recommendation{totalRecommendations !== 1 ? 's' : ''}
        </Badge>
      </div>

      {Object.entries(RECOMMENDATION_TYPES).map(([type, config]) => {
        const items = recommendations[type as keyof Recommendations];
        if (items.length === 0) return null;

        const Icon = config.icon;
        const colorClass = AnalyticsUtils.getRecommendationColor(type as 'immediate' | 'lifestyle' | 'clinical');

        return (
          <Card key={type} className="overflow-hidden">
            <CardHeader className={`${colorClass} border-b`}>
              <CardTitle className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {config.title}
                    <Badge variant="outline" className="text-xs">
                      {config.priority} PRIORITY
                    </Badge>
                  </div>
                  <p className="text-xs font-normal opacity-90 mt-1">
                    {config.description}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-4">
              <div className="space-y-3">
                {items.map((recommendation, index) => {
                  const itemId = `${type}-${index}`;
                  const isCompleted = completedItems.has(itemId);

                  return (
                    <Alert
                      key={index}
                      className={`cursor-pointer transition-all hover:shadow-sm ${
                        isCompleted 
                          ? 'bg-green-50 border-green-200 opacity-60' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleCompleted(itemId)}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          className={`mt-0.5 rounded-full p-0.5 transition-colors ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : 'border-2 border-muted-foreground'
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                        </button>
                        
                        <AlertDescription className={`flex-1 ${isCompleted ? 'line-through' : ''}`}>
                          {recommendation}
                        </AlertDescription>
                        
                        {!isCompleted && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </Alert>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Progress Summary */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Info className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Progress Tracking</div>
                <div className="text-sm text-muted-foreground">
                  {completedItems.size} of {totalRecommendations} recommendations completed
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((completedItems.size / totalRecommendations) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function RecommendationsSummaryCard({ recommendations }: RecommendationsProps) {
  const totalRecommendations = 
    recommendations.immediate.length + 
    recommendations.lifestyle.length + 
    recommendations.clinical.length;

  const hasUrgent = recommendations.immediate.length > 0 || recommendations.clinical.length > 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${hasUrgent ? 'bg-orange-100' : 'bg-blue-100'}`}>
              {hasUrgent ? (
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              ) : (
                <Heart className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <div>
              <div className="font-medium">Recommendations</div>
              <div className="text-sm text-muted-foreground">
                {totalRecommendations} suggestion{totalRecommendations !== 1 ? 's' : ''} available
              </div>
            </div>
          </div>
          
          <Button variant="outline" size="sm" className="text-xs">
            View All <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        {hasUrgent && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-medium">
                {recommendations.immediate.length + recommendations.clinical.length} urgent item{recommendations.immediate.length + recommendations.clinical.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}