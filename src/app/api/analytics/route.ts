import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { 
  WellnessAnalyzer,
  SleepProgramService 
} from '@/lib/clinical';

// Analytics request schema
const analyticsRequestSchema = z.object({
  programId: z.string().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  includeCorrelations: z.boolean().default(false),
  includeTrends: z.boolean().default(true),
  includeRecommendations: z.boolean().default(true)
});

interface AnalyticsParams {
  entries: ClinicalSleepEntry[];
  includeCorrelations?: boolean;
  includeTrends?: boolean;
  includeRecommendations?: boolean;
}

// Type for clinical sleep entry from database
interface ClinicalSleepEntry {
  id: string;
  userId: string;
  date: Date;
  sleepEfficiency: number | null;
  sleepLatencyHours: number;
  sleepLatencyMins: number;
  nightAwakenings: number;
  totalSleepHours: number;
  totalSleepMins: number;
  sleepQuality: number;
  morningAlertness: number | null;
  daytimeEnergy: number | null;
  daytimeFocus: number | null;
  daytimeMood: number | null;
  sleepProgram?: {
    id: string;
    name: string;
    status: string;
  } | null;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const params = analyticsRequestSchema.parse(body);

    // Build query conditions
    const whereClause: Record<string, unknown> = {
      userId: session.user.id
    };

    if (params.programId) {
      // Verify program access
      const program = await SleepProgramService.getProgramWithEntries(params.programId);
      if (!program || program.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Invalid or inaccessible program' },
          { status: 403 }
        );
      }
      whereClause.sleepProgramId = params.programId;
    }

    if (params.dateFrom) {
      whereClause.date = {
        ...whereClause.date,
        gte: new Date(params.dateFrom)
      };
    }

    if (params.dateTo) {
      whereClause.date = {
        ...whereClause.date,
        lte: new Date(params.dateTo)
      };
    }

    // Fetch entries
    const entries = await prisma.clinicalSleepEntry.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
      include: {
        sleepProgram: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    });

    if (entries.length === 0) {
      return NextResponse.json({
        success: true,
        analytics: null,
        message: 'No entries found for the specified criteria'
      });
    }

    // Generate comprehensive analytics
    const analytics = await generateAnalytics({
      entries,
      includeCorrelations: params.includeCorrelations,
      includeTrends: params.includeTrends,
      includeRecommendations: params.includeRecommendations
    });

    return NextResponse.json({
      success: true,
      analytics,
      dataPoints: entries.length,
      dateRange: {
        from: entries[0].date,
        to: entries[entries.length - 1].date
      },
      message: 'Analytics generated successfully'
    });

  } catch (error) {
    console.error('Analytics generation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}

async function generateAnalytics({
  entries,
  includeCorrelations = false,
  includeTrends = true,
  includeRecommendations = true
}: AnalyticsParams) {
  // Basic sleep metrics
  const sleepMetrics = calculateSleepMetrics(entries);
  
  // Wellness analysis
  const wellnessAnalysis = calculateWellnessAnalysis(entries);
  
  // Sleep quality patterns
  const qualityPatterns = calculateQualityPatterns(entries);
  
  // Clinical insights
  const clinicalInsights = generateClinicalInsights(entries);

  let trends = null;
  if (includeTrends && entries.length >= 7) {
    trends = calculateTrends(entries);
  }

  let correlations = null;
  if (includeCorrelations && entries.length >= 10) {
    correlations = calculateCorrelations(entries);
  }

  let recommendations = null;
  if (includeRecommendations) {
    recommendations = generateRecommendations({
      sleepMetrics,
      wellnessAnalysis,
      qualityPatterns,
      clinicalInsights,
      trends
    });
  }

  return {
    sleepMetrics,
    wellnessAnalysis,
    qualityPatterns,
    clinicalInsights,
    trends,
    correlations,
    recommendations,
    generatedAt: new Date().toISOString()
  };
}

function calculateSleepMetrics(entries: ClinicalSleepEntry[]) {
  const validEntries = entries.filter(e => e.sleepEfficiency !== null);
  
  if (validEntries.length === 0) {
    return null;
  }

  const totalSleepTimes = entries.map(e => (e.totalSleepHours * 60) + e.totalSleepMins);
  const sleepEfficiencies = validEntries.map(e => e.sleepEfficiency);
  const sleepLatencies = entries.map(e => (e.sleepLatencyHours * 60) + e.sleepLatencyMins);
  const nightAwakenings = entries.map(e => e.nightAwakenings);
  const sleepQualities = entries.map(e => e.sleepQuality);

  return {
    totalSleep: {
      average: average(totalSleepTimes),
      median: median(totalSleepTimes),
      range: { min: Math.min(...totalSleepTimes), max: Math.max(...totalSleepTimes) },
      consistency: calculateConsistency(totalSleepTimes)
    },
    sleepEfficiency: {
      average: average(sleepEfficiencies),
      median: median(sleepEfficiencies),
      range: { min: Math.min(...sleepEfficiencies), max: Math.max(...sleepEfficiencies) },
      clinicalCategory: categorizeSleepEfficiency(average(sleepEfficiencies))
    },
    sleepLatency: {
      average: average(sleepLatencies),
      median: median(sleepLatencies),
      range: { min: Math.min(...sleepLatencies), max: Math.max(...sleepLatencies) },
      clinicalCategory: categorizeSleepLatency(average(sleepLatencies))
    },
    nightAwakenings: {
      average: average(nightAwakenings),
      median: median(nightAwakenings),
      range: { min: Math.min(...nightAwakenings), max: Math.max(...nightAwakenings) }
    },
    sleepQuality: {
      average: average(sleepQualities),
      median: median(sleepQualities),
      distribution: calculateDistribution(sleepQualities, 1, 5)
    }
  };
}

function calculateWellnessAnalysis(entries: ClinicalSleepEntry[]) {
  const wellnessEntries = entries.filter(e => 
    e.morningAlertness !== null || 
    e.daytimeEnergy !== null || 
    e.daytimeFocus !== null || 
    e.daytimeMood !== null
  );

  if (wellnessEntries.length === 0) {
    return null;
  }

  const alertnessScores = wellnessEntries.map(e => e.morningAlertness).filter(s => s !== null);
  const energyScores = wellnessEntries.map(e => e.daytimeEnergy).filter(s => s !== null);
  const focusScores = wellnessEntries.map(e => e.daytimeFocus).filter(s => s !== null);
  const moodScores = wellnessEntries.map(e => e.daytimeMood).filter(s => s !== null);

  const wellnessData = wellnessEntries.map(entry => ({
    date: entry.date,
    morningAlertness: entry.morningAlertness,
    daytimeEnergy: entry.daytimeEnergy,
    daytimeFocus: entry.daytimeFocus,
    daytimeMood: entry.daytimeMood
  }));

  const wellnessTrends = WellnessAnalyzer.calculateWellnessTrends(wellnessData);

  return {
    morningAlertness: alertnessScores.length > 0 ? {
      average: average(alertnessScores),
      trend: WellnessAnalyzer.calculateTrend(alertnessScores),
      category: WellnessAnalyzer.categorizeWellnessScore(average(alertnessScores)),
      consistency: WellnessAnalyzer.calculateConsistencyScore(alertnessScores)
    } : null,
    daytimeEnergy: energyScores.length > 0 ? {
      average: average(energyScores),
      trend: WellnessAnalyzer.calculateTrend(energyScores),
      category: WellnessAnalyzer.categorizeWellnessScore(average(energyScores)),
      consistency: WellnessAnalyzer.calculateConsistencyScore(energyScores)
    } : null,
    daytimeFocus: focusScores.length > 0 ? {
      average: average(focusScores),
      trend: WellnessAnalyzer.calculateTrend(focusScores),
      category: WellnessAnalyzer.categorizeWellnessScore(average(focusScores)),
      consistency: WellnessAnalyzer.calculateConsistencyScore(focusScores)
    } : null,
    daytimeMood: moodScores.length > 0 ? {
      average: average(moodScores),
      trend: WellnessAnalyzer.calculateTrend(moodScores),
      category: WellnessAnalyzer.categorizeWellnessScore(average(moodScores)),
      consistency: WellnessAnalyzer.calculateConsistencyScore(moodScores)
    } : null,
    overallTrends: wellnessTrends,
    trackingCompletion: (wellnessEntries.length / entries.length) * 100
  };
}

function calculateQualityPatterns(entries: ClinicalSleepEntry[]) {
  // Day of week analysis
  const dayOfWeekData: { [key: string]: number[] } = {};
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  entries.forEach(entry => {
    const dayOfWeek = new Date(entry.date).getDay();
    const dayName = dayNames[dayOfWeek];
    
    if (!dayOfWeekData[dayName]) {
      dayOfWeekData[dayName] = [];
    }
    dayOfWeekData[dayName].push(entry.sleepQuality);
  });

  const dayOfWeekAnalysis = Object.entries(dayOfWeekData).map(([day, qualities]) => ({
    day,
    average: average(qualities),
    count: qualities.length
  })).sort((a, b) => b.average - a.average);

  // Sleep quality distribution
  const qualityDistribution = calculateDistribution(
    entries.map(e => e.sleepQuality), 1, 5
  );

  // Quality stability
  const sleepQualities = entries.map(e => e.sleepQuality);
  const qualityStability = calculateConsistency(sleepQualities);

  return {
    dayOfWeekAnalysis,
    qualityDistribution,
    bestDays: dayOfWeekAnalysis.slice(0, 3),
    worstDays: dayOfWeekAnalysis.slice(-3).reverse(),
    qualityStability: {
      score: qualityStability,
      category: qualityStability >= 80 ? 'Very Stable' : 
               qualityStability >= 60 ? 'Stable' : 
               qualityStability >= 40 ? 'Somewhat Variable' : 'Highly Variable'
    }
  };
}

function generateClinicalInsights(entries: ClinicalSleepEntry[]) {
  const flags: string[] = [];
  const observations: string[] = [];
  
  const avgEfficiency = average(entries.map(e => e.sleepEfficiency).filter(e => e !== null));
  const avgLatency = average(entries.map(e => (e.sleepLatencyHours * 60) + e.sleepLatencyMins));
  const avgAwakenings = average(entries.map(e => e.nightAwakenings));
  const avgQuality = average(entries.map(e => e.sleepQuality));

  // Clinical thresholds
  if (avgEfficiency < 80) {
    flags.push('LOW_SLEEP_EFFICIENCY');
    observations.push(`Sleep efficiency of ${avgEfficiency.toFixed(1)}% suggests possible sleep maintenance issues`);
  }

  if (avgLatency > 30) {
    flags.push('ELEVATED_SLEEP_LATENCY');
    observations.push(`Average sleep latency of ${avgLatency.toFixed(1)} minutes may indicate sleep onset difficulties`);
  }

  if (avgAwakenings > 3) {
    flags.push('FREQUENT_AWAKENINGS');
    observations.push(`Average of ${avgAwakenings.toFixed(1)} awakenings per night suggests sleep fragmentation`);
  }

  if (avgQuality < 3) {
    flags.push('POOR_SLEEP_QUALITY');
    observations.push(`Average sleep quality of ${avgQuality.toFixed(1)}/5 indicates subjective sleep dissatisfaction`);
  }

  // Positive observations
  if (avgEfficiency >= 85) {
    observations.push(`Excellent sleep efficiency of ${avgEfficiency.toFixed(1)}% indicates good sleep consolidation`);
  }

  if (avgLatency <= 20) {
    observations.push(`Good sleep onset with average latency of ${avgLatency.toFixed(1)} minutes`);
  }

  return {
    clinicalFlags: flags,
    observations,
    riskLevel: flags.length >= 3 ? 'HIGH' : flags.length >= 2 ? 'MEDIUM' : flags.length >= 1 ? 'LOW' : 'MINIMAL',
    assessmentSummary: generateAssessmentSummary(avgEfficiency, avgLatency, avgAwakenings, avgQuality)
  };
}

function calculateTrends(entries: ClinicalSleepEntry[]) {
  const sleepQualities = entries.map(e => e.sleepQuality);
  const sleepEfficiencies = entries.map(e => e.sleepEfficiency).filter(e => e !== null);
  const totalSleepTimes = entries.map(e => (e.totalSleepHours * 60) + e.totalSleepMins);

  return {
    sleepQuality: {
      trend: WellnessAnalyzer.calculateTrend(sleepQualities),
      changeRate: calculateChangeRate(sleepQualities)
    },
    sleepEfficiency: {
      trend: WellnessAnalyzer.calculateTrend(sleepEfficiencies),
      changeRate: calculateChangeRate(sleepEfficiencies)
    },
    totalSleepTime: {
      trend: WellnessAnalyzer.calculateTrend(totalSleepTimes),
      changeRate: calculateChangeRate(totalSleepTimes)
    },
    overall: determineOverallTrend(sleepQualities, sleepEfficiencies, totalSleepTimes)
  };
}

function calculateCorrelations(entries: ClinicalSleepEntry[]) {
  const sleepQualities = entries.map(e => e.sleepQuality);
  const sleepEfficiencies = entries.map(e => e.sleepEfficiency).filter(e => e !== null);
  const totalSleepTimes = entries.map(e => (e.totalSleepHours * 60) + e.totalSleepMins);
  const sleepLatencies = entries.map(e => (e.sleepLatencyHours * 60) + e.sleepLatencyMins);
  
  // Wellness correlations (if data available)
  const wellnessEntries = entries.filter(e => 
    e.morningAlertness !== null && 
    e.daytimeEnergy !== null && 
    e.daytimeFocus !== null && 
    e.daytimeMood !== null
  );

  let wellnessCorrelations = null;
  if (wellnessEntries.length >= 10) {
    const alertnessScores = wellnessEntries.map(e => e.morningAlertness);
    const energyScores = wellnessEntries.map(e => e.daytimeEnergy);
    const focusScores = wellnessEntries.map(e => e.daytimeFocus);
    const moodScores = wellnessEntries.map(e => e.daytimeMood);
    const qualitiesForWellness = wellnessEntries.map(e => e.sleepQuality);

    wellnessCorrelations = {
      sleepQualityVsAlertness: WellnessAnalyzer.calculateCorrelation(qualitiesForWellness, alertnessScores),
      sleepQualityVsEnergy: WellnessAnalyzer.calculateCorrelation(qualitiesForWellness, energyScores),
      sleepQualityVsFocus: WellnessAnalyzer.calculateCorrelation(qualitiesForWellness, focusScores),
      sleepQualityVsMood: WellnessAnalyzer.calculateCorrelation(qualitiesForWellness, moodScores)
    };
  }

  return {
    sleepMetrics: {
      qualityVsEfficiency: sleepEfficiencies.length > 0 ? 
        WellnessAnalyzer.calculateCorrelation(sleepQualities.slice(0, sleepEfficiencies.length), sleepEfficiencies) : null,
      qualityVsDuration: WellnessAnalyzer.calculateCorrelation(sleepQualities, totalSleepTimes),
      qualityVsLatency: WellnessAnalyzer.calculateCorrelation(sleepQualities, sleepLatencies),
      efficiencyVsDuration: sleepEfficiencies.length > 0 ? 
        WellnessAnalyzer.calculateCorrelation(sleepEfficiencies, totalSleepTimes.slice(0, sleepEfficiencies.length)) : null
    },
    wellness: wellnessCorrelations
  };
}

function generateRecommendations(data: {
  sleepMetrics: any;
  wellnessAnalysis: any;
  qualityPatterns: any;
  clinicalInsights: any;
  trends: any;
}) {
  const recommendations = {
    immediate: [] as string[],
    lifestyle: [] as string[],
    clinical: [] as string[]
  };

  const { sleepMetrics, clinicalInsights, trends } = data;

  // Sleep efficiency recommendations
  if (sleepMetrics?.sleepEfficiency?.average < 80) {
    recommendations.clinical.push('Sleep efficiency below 80% warrants clinical evaluation for sleep disorders');
    recommendations.lifestyle.push('Consider sleep restriction therapy: limit time in bed to actual sleep time');
  } else if (sleepMetrics?.sleepEfficiency?.average < 85) {
    recommendations.lifestyle.push('Optimize sleep efficiency through consistent sleep schedule and sleep hygiene');
  }

  // Sleep latency recommendations
  if (sleepMetrics?.sleepLatency?.average > 30) {
    recommendations.immediate.push('Practice relaxation techniques before bedtime to reduce sleep onset time');
    recommendations.lifestyle.push('Establish consistent pre-sleep routine 30-60 minutes before bedtime');
  }

  // Quality trend recommendations
  if (trends?.sleepQuality?.trend === 'declining') {
    recommendations.immediate.push('Review recent changes in routine, stress, or environment affecting sleep');
    recommendations.lifestyle.push('Focus on sleep hygiene fundamentals: schedule, environment, pre-sleep activities');
  }

  // Clinical flags recommendations
  if (clinicalInsights?.riskLevel === 'HIGH') {
    recommendations.clinical.push('Multiple sleep concerns detected - consider comprehensive sleep medicine evaluation');
  }

  return recommendations;
}

// Utility functions
function average(numbers: number[]): number {
  return numbers.length > 0 ? numbers.reduce((sum, val) => sum + val, 0) / numbers.length : 0;
}

function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function calculateConsistency(values: number[]): number {
  if (values.length < 2) return 100;
  const mean = average(values);
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? (stdDev / mean) * 100 : 0;
  return Math.max(0, 100 - cv);
}

function calculateDistribution(values: number[], min: number, max: number) {
  const distribution: { [key: number]: number } = {};
  
  for (let i = min; i <= max; i++) {
    distribution[i] = 0;
  }
  
  values.forEach(val => {
    if (val >= min && val <= max) {
      distribution[val]++;
    }
  });
  
  return distribution;
}

function categorizeSleepEfficiency(efficiency: number): string {
  if (efficiency >= 85) return 'Excellent';
  if (efficiency >= 80) return 'Good';
  if (efficiency >= 75) return 'Fair';
  return 'Poor';
}

function categorizeSleepLatency(latency: number): string {
  if (latency <= 15) return 'Excellent';
  if (latency <= 30) return 'Good';
  if (latency <= 60) return 'Fair';
  return 'Poor';
}

function calculateChangeRate(values: number[]): number {
  if (values.length < 2) return 0;
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstAvg = average(firstHalf);
  const secondAvg = average(secondHalf);
  return firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
}

function determineOverallTrend(qualities: number[], efficiencies: number[], durations: number[]): string {
  const qualityTrend = WellnessAnalyzer.calculateTrend(qualities);
  const efficiencyTrend = efficiencies.length > 0 ? WellnessAnalyzer.calculateTrend(efficiencies) : 'stable';
  
  const trends = [qualityTrend, efficiencyTrend];
  const improving = trends.filter(t => t === 'improving').length;
  const declining = trends.filter(t => t === 'declining').length;
  
  if (improving > declining) return 'improving';
  if (declining > improving) return 'declining';
  return 'stable';
}

function generateAssessmentSummary(efficiency: number, latency: number, awakenings: number, quality: number): string {
  const issues: string[] = [];
  
  if (efficiency < 80) issues.push('low sleep efficiency');
  if (latency > 30) issues.push('prolonged sleep latency');
  if (awakenings > 3) issues.push('frequent awakenings');
  if (quality < 3) issues.push('poor subjective quality');
  
  if (issues.length === 0) {
    return 'Sleep parameters within normal clinical ranges';
  }
  
  return `Clinical concerns identified: ${issues.join(', ')}`;
}