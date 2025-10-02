'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { ClinicalInsights } from '@/types/analytics';
import { AnalyticsUtils } from '@/lib/services/analytics';

interface ClinicalInsightsPanelProps {
  insights: ClinicalInsights;
}

const CLINICAL_FLAG_DESCRIPTIONS: { [key: string]: string } = {
  LOW_SLEEP_EFFICIENCY: 'Sleep efficiency below 80% may indicate difficulty maintaining sleep',
  ELEVATED_SLEEP_LATENCY: 'Taking longer than 30 minutes to fall asleep consistently',
  FREQUENT_AWAKENINGS: 'Multiple awakenings per night affecting sleep quality',
  POOR_SLEEP_QUALITY: 'Subjective sleep quality ratings consistently below average',
};

const RISK_LEVEL_ICONS = {
  MINIMAL: CheckCircle,
  LOW: Info,
  MEDIUM: AlertTriangle,
  HIGH: XCircle,
};

const RISK_LEVEL_DESCRIPTIONS = {
  MINIMAL: 'Your sleep patterns appear to be within healthy ranges',
  LOW: 'Minor areas for improvement identified in your sleep patterns',
  MEDIUM: 'Several sleep concerns that may benefit from lifestyle adjustments',
  HIGH: 'Multiple concerning patterns that warrant professional evaluation',
};

export function ClinicalInsightsPanel({ insights }: ClinicalInsightsPanelProps) {
  const RiskIcon = RISK_LEVEL_ICONS[insights.riskLevel];
  const riskColorClass = AnalyticsUtils.getRiskLevelColor(insights.riskLevel);

  return (
    <div className="space-y-6">
      {/* Risk Level Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RiskIcon className="h-5 w-5" />
            Clinical Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risk Level:</span>
              <Badge className={`${riskColorClass} font-medium`}>
                {insights.riskLevel}
              </Badge>
            </div>
            
            <Alert className={`border ${riskColorClass}`}>
              <AlertDescription>
                {RISK_LEVEL_DESCRIPTIONS[insights.riskLevel]}
              </AlertDescription>
            </Alert>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Assessment Summary:</strong> {insights.assessmentSummary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Flags */}
      {insights.clinicalFlags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">
              Clinical Concerns ({insights.clinicalFlags.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.clinicalFlags.map((flag, index) => (
                <Alert key={index} className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-800 text-sm">
                    {flag.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </AlertTitle>
                  <AlertDescription className="text-orange-700 text-xs">
                    {CLINICAL_FLAG_DESCRIPTIONS[flag] || 'Identified concern requiring attention'}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinical Observations */}
      {insights.observations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Clinical Observations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.observations.map((observation, index) => {
                const isPositive = observation.toLowerCase().includes('excellent') || 
                                 observation.toLowerCase().includes('good');
                
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border text-sm ${
                      isPositive 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isPositive ? (
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span>{observation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {insights.clinicalFlags.length === 0 && insights.observations.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-2">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="text-lg font-medium">All Clear</h3>
              <p className="text-muted-foreground">
                No significant clinical concerns detected in your sleep patterns.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function ClinicalSummaryCard({ insights }: ClinicalInsightsPanelProps) {
  const RiskIcon = RISK_LEVEL_ICONS[insights.riskLevel];
  const riskColorClass = AnalyticsUtils.getRiskLevelColor(insights.riskLevel);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RiskIcon className={`h-6 w-6 ${riskColorClass.split(' ')[0]}`} />
            <div>
              <div className="font-medium">Clinical Risk</div>
              <div className="text-sm text-muted-foreground">
                {insights.clinicalFlags.length} concern{insights.clinicalFlags.length !== 1 ? 's' : ''} detected
              </div>
            </div>
          </div>
          <Badge className={`${riskColorClass} font-medium`}>
            {insights.riskLevel}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}