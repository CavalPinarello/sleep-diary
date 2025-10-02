export interface SleepMetricRange {
  min: number;
  max: number;
}

export interface SleepMetricStats {
  average: number;
  median: number;
  range: SleepMetricRange;
  consistency?: number;
  clinicalCategory?: string;
}

export interface SleepMetrics {
  totalSleep: SleepMetricStats;
  sleepEfficiency: SleepMetricStats;
  sleepLatency: SleepMetricStats;
  nightAwakenings: Omit<SleepMetricStats, 'clinicalCategory'>;
  sleepQuality: {
    average: number;
    median: number;
    distribution: { [key: number]: number };
  };
}

export interface WellnessMetric {
  average: number;
  trend: 'improving' | 'declining' | 'stable';
  category: string;
  consistency: number;
}

export interface WellnessAnalysis {
  morningAlertness: WellnessMetric | null;
  daytimeEnergy: WellnessMetric | null;
  daytimeFocus: WellnessMetric | null;
  daytimeMood: WellnessMetric | null;
  overallTrends: {
    improving: number;
    declining: number;
    stable: number;
  };
  trackingCompletion: number;
}

export interface DayOfWeekAnalysis {
  day: string;
  average: number;
  count: number;
}

export interface QualityPatterns {
  dayOfWeekAnalysis: DayOfWeekAnalysis[];
  qualityDistribution: { [key: number]: number };
  bestDays: DayOfWeekAnalysis[];
  worstDays: DayOfWeekAnalysis[];
  qualityStability: {
    score: number;
    category: string;
  };
}

export interface ClinicalInsights {
  clinicalFlags: string[];
  observations: string[];
  riskLevel: 'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH';
  assessmentSummary: string;
}

export interface TrendMetric {
  trend: 'improving' | 'declining' | 'stable';
  changeRate: number;
}

export interface Trends {
  sleepQuality: TrendMetric;
  sleepEfficiency: TrendMetric;
  totalSleepTime: TrendMetric;
  overall: 'improving' | 'declining' | 'stable';
}

export interface CorrelationMetrics {
  qualityVsEfficiency: number | null;
  qualityVsDuration: number;
  qualityVsLatency: number;
  efficiencyVsDuration: number | null;
}

export interface WellnessCorrelations {
  sleepQualityVsAlertness: number;
  sleepQualityVsEnergy: number;
  sleepQualityVsFocus: number;
  sleepQualityVsMood: number;
}

export interface Correlations {
  sleepMetrics: CorrelationMetrics;
  wellness: WellnessCorrelations | null;
}

export interface Recommendations {
  immediate: string[];
  lifestyle: string[];
  clinical: string[];
}

export interface Analytics {
  sleepMetrics: SleepMetrics | null;
  wellnessAnalysis: WellnessAnalysis | null;
  qualityPatterns: QualityPatterns;
  clinicalInsights: ClinicalInsights;
  trends: Trends | null;
  correlations: Correlations | null;
  recommendations: Recommendations | null;
  generatedAt: string;
}

export interface AnalyticsResponse {
  success: boolean;
  analytics: Analytics | null;
  dataPoints: number;
  dateRange: {
    from: string;
    to: string;
  };
  message: string;
}

export interface AnalyticsRequest {
  programId?: string;
  dateFrom?: string;
  dateTo?: string;
  includeCorrelations?: boolean;
  includeTrends?: boolean;
  includeRecommendations?: boolean;
}

// UI Component Props Types
export interface MetricCardProps {
  title: string;
  value: string | number;
  category?: string;
  trend?: 'improving' | 'declining' | 'stable';
  unit?: string;
  description?: string;
}

export interface ClinicalFlagType {
  flag: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TrendChartProps {
  data: ChartDataPoint[];
  title: string;
  yAxisLabel: string;
  trend?: 'improving' | 'declining' | 'stable';
}