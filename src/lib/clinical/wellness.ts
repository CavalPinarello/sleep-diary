/**
 * Wellness Metrics Analysis
 * Subjective Wellness Parameter Calculations and Correlations
 * 
 * This module handles the analysis of daily functioning metrics:
 * - Morning Alertness, Daytime Energy, Cognitive Focus, Daily Mood
 * - Correlations with sleep parameters
 * - Trend analysis and pattern recognition
 */

// Removed unused imports - types are defined locally where needed

export interface WellnessAnalysis {
  overallScore: number;
  breakdown: {
    morningAlertness: WellnessParameterAnalysis;
    daytimeEnergy: WellnessParameterAnalysis;
    daytimeFocus: WellnessParameterAnalysis;
    daytimeMood: WellnessParameterAnalysis;
  };
  trends: WellnessTrends;
  correlations: WellnessCorrelations;
}

export interface WellnessParameterAnalysis {
  current?: number;
  average: number;
  trend: 'improving' | 'declining' | 'stable';
  category: 'excellent' | 'good' | 'fair' | 'poor';
  daysTracked: number;
}

export interface WellnessTrends {
  weekOverWeek: number; // % change from previous week
  overallDirection: 'improving' | 'declining' | 'stable';
  consistencyScore: number; // 0-100, higher = more consistent
}

export interface WellnessCorrelations {
  sleepDuration: {
    alertness: number;
    energy: number;
    focus: number;
    mood: number;
  };
  sleepEfficiency: {
    alertness: number;
    energy: number;
    focus: number;
    mood: number;
  };
  sleepLatency: {
    alertness: number;
    energy: number;
    focus: number;
    mood: number;
  };
}

export interface DailyWellnessEntry {
  date: Date;
  morningAlertness?: number;
  daytimeEnergy?: number;
  daytimeFocus?: number;
  daytimeMood?: number;
  sleepDuration: number; // minutes
  sleepEfficiency: number;
  sleepLatency: number; // minutes
}

/**
 * Wellness analysis and correlation calculations
 */
export class WellnessAnalyzer {
  /**
   * Categorize wellness score into descriptive categories
   */
  static categorizeWellnessScore(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'fair';
    return 'poor';
  }

  /**
   * Calculate trend direction from a series of values
   */
  static calculateTrend(values: number[]): 'improving' | 'declining' | 'stable' {
    if (values.length < 3) return 'stable';

    // Simple linear regression slope
    const n = values.length;
    const xSum = (n * (n - 1)) / 2; // Sum of indices 0, 1, 2, ...
    const xMean = xSum / n;
    const ySum = values.reduce((sum, val) => sum + val, 0);
    const yMean = ySum / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = i - xMean;
      const yDiff = values[i] - yMean;
      numerator += xDiff * yDiff;
      denominator += xDiff * xDiff;
    }

    const slope = denominator === 0 ? 0 : numerator / denominator;

    // Threshold for detecting meaningful trends
    const threshold = 0.1;
    if (slope > threshold) return 'improving';
    if (slope < -threshold) return 'declining';
    return 'stable';
  }

  /**
   * Calculate consistency score (0-100) based on standard deviation
   */
  static calculateConsistencyScore(values: number[]): number {
    if (values.length < 2) return 100;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Convert std dev to consistency score (lower std dev = higher consistency)
    // Assuming max std dev of ~3 for 1-10 scale
    const consistencyScore = Math.max(0, 100 - (stdDev * 33.33));
    return Math.round(consistencyScore);
  }

  /**
   * Calculate Pearson correlation coefficient between two arrays
   */
  static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const xMean = x.reduce((sum, val) => sum + val, 0) / n;
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let xDenominator = 0;
    let yDenominator = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;
      numerator += xDiff * yDiff;
      xDenominator += xDiff * xDiff;
      yDenominator += yDiff * yDiff;
    }

    const denominator = Math.sqrt(xDenominator * yDenominator);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Analyze individual wellness parameter
   */
  static analyzeParameter(
    values: (number | undefined)[],
    _parameterName: string
  ): WellnessParameterAnalysis {
    const validValues = values.filter((v): v is number => v !== undefined && v !== null);
    
    if (validValues.length === 0) {
      return {
        average: 0,
        trend: 'stable',
        category: 'poor',
        daysTracked: 0
      };
    }

    const current = validValues[validValues.length - 1];
    const average = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
    const trend = this.calculateTrend(validValues);
    const category = this.categorizeWellnessScore(average);

    return {
      current,
      average: parseFloat(average.toFixed(1)),
      trend,
      category,
      daysTracked: validValues.length
    };
  }

  /**
   * Calculate comprehensive wellness trends
   */
  static calculateWellnessTrends(entries: DailyWellnessEntry[]): WellnessTrends {
    if (entries.length < 7) {
      return {
        weekOverWeek: 0,
        overallDirection: 'stable',
        consistencyScore: 100
      };
    }

    // Calculate overall wellness scores for each day
    const dailyScores: number[] = [];
    for (const entry of entries) {
      const scores = [
        entry.morningAlertness,
        entry.daytimeEnergy,
        entry.daytimeFocus,
        entry.daytimeMood
      ].filter((score): score is number => score !== undefined);
      
      if (scores.length > 0) {
        dailyScores.push(scores.reduce((sum, score) => sum + score, 0) / scores.length);
      }
    }

    if (dailyScores.length < 7) {
      return {
        weekOverWeek: 0,
        overallDirection: 'stable',
        consistencyScore: 100
      };
    }

    // Calculate week-over-week change
    const recentWeek = dailyScores.slice(-7);
    const previousWeek = dailyScores.slice(-14, -7);
    
    let weekOverWeek = 0;
    if (previousWeek.length >= 3) {
      const recentAvg = recentWeek.reduce((sum, val) => sum + val, 0) / recentWeek.length;
      const previousAvg = previousWeek.reduce((sum, val) => sum + val, 0) / previousWeek.length;
      weekOverWeek = ((recentAvg - previousAvg) / previousAvg) * 100;
    }

    const overallDirection = this.calculateTrend(dailyScores);
    const consistencyScore = this.calculateConsistencyScore(dailyScores);

    return {
      weekOverWeek: parseFloat(weekOverWeek.toFixed(1)),
      overallDirection,
      consistencyScore
    };
  }

  /**
   * Calculate correlations between wellness metrics and sleep parameters
   */
  static calculateWellnessCorrelations(entries: DailyWellnessEntry[]): WellnessCorrelations {
    // Filter entries with complete data
    const completeEntries = entries.filter(entry => 
      entry.morningAlertness !== undefined &&
      entry.daytimeEnergy !== undefined &&
      entry.daytimeFocus !== undefined &&
      entry.daytimeMood !== undefined
    );

    if (completeEntries.length < 3) {
      // Return zero correlations if insufficient data
      return {
        sleepDuration: { alertness: 0, energy: 0, focus: 0, mood: 0 },
        sleepEfficiency: { alertness: 0, energy: 0, focus: 0, mood: 0 },
        sleepLatency: { alertness: 0, energy: 0, focus: 0, mood: 0 }
      };
    }

    // Extract arrays for correlation calculation
    const sleepDurations = completeEntries.map(e => e.sleepDuration);
    const sleepEfficiencies = completeEntries.map(e => e.sleepEfficiency);
    const sleepLatencies = completeEntries.map(e => e.sleepLatency);
    
    const alertnessScores = completeEntries.map(e => e.morningAlertness!);
    const energyScores = completeEntries.map(e => e.daytimeEnergy!);
    const focusScores = completeEntries.map(e => e.daytimeFocus!);
    const moodScores = completeEntries.map(e => e.daytimeMood!);

    return {
      sleepDuration: {
        alertness: parseFloat(this.calculateCorrelation(sleepDurations, alertnessScores).toFixed(3)),
        energy: parseFloat(this.calculateCorrelation(sleepDurations, energyScores).toFixed(3)),
        focus: parseFloat(this.calculateCorrelation(sleepDurations, focusScores).toFixed(3)),
        mood: parseFloat(this.calculateCorrelation(sleepDurations, moodScores).toFixed(3))
      },
      sleepEfficiency: {
        alertness: parseFloat(this.calculateCorrelation(sleepEfficiencies, alertnessScores).toFixed(3)),
        energy: parseFloat(this.calculateCorrelation(sleepEfficiencies, energyScores).toFixed(3)),
        focus: parseFloat(this.calculateCorrelation(sleepEfficiencies, focusScores).toFixed(3)),
        mood: parseFloat(this.calculateCorrelation(sleepEfficiencies, moodScores).toFixed(3))
      },
      sleepLatency: {
        alertness: parseFloat(this.calculateCorrelation(sleepLatencies, alertnessScores).toFixed(3)),
        energy: parseFloat(this.calculateCorrelation(sleepLatencies, energyScores).toFixed(3)),
        focus: parseFloat(this.calculateCorrelation(sleepLatencies, focusScores).toFixed(3)),
        mood: parseFloat(this.calculateCorrelation(sleepLatencies, moodScores).toFixed(3))
      }
    };
  }

  /**
   * Generate comprehensive wellness analysis
   */
  static analyzeWellness(entries: DailyWellnessEntry[]): WellnessAnalysis {
    const alertnessValues = entries.map(e => e.morningAlertness);
    const energyValues = entries.map(e => e.daytimeEnergy);
    const focusValues = entries.map(e => e.daytimeFocus);
    const moodValues = entries.map(e => e.daytimeMood);

    const breakdown = {
      morningAlertness: this.analyzeParameter(alertnessValues, 'Morning Alertness'),
      daytimeEnergy: this.analyzeParameter(energyValues, 'Daytime Energy'),
      daytimeFocus: this.analyzeParameter(focusValues, 'Cognitive Focus'),
      daytimeMood: this.analyzeParameter(moodValues, 'Daily Mood')
    };

    // Calculate overall score from individual averages
    const individualAverages = Object.values(breakdown)
      .filter(param => param.daysTracked > 0)
      .map(param => param.average);
    
    const overallScore = individualAverages.length > 0
      ? parseFloat((individualAverages.reduce((sum, avg) => sum + avg, 0) / individualAverages.length).toFixed(1))
      : 0;

    const trends = this.calculateWellnessTrends(entries);
    const correlations = this.calculateWellnessCorrelations(entries);

    return {
      overallScore,
      breakdown,
      trends,
      correlations
    };
  }

  /**
   * Generate wellness insights based on analysis
   */
  static generateWellnessInsights(analysis: WellnessAnalysis): string[] {
    const insights: string[] = [];
    const { breakdown, trends, correlations } = analysis;

    // Overall wellness insights
    if (analysis.overallScore >= 8) {
      insights.push("Your overall wellness scores indicate excellent daily functioning.");
    } else if (analysis.overallScore >= 6) {
      insights.push("Your wellness scores show good daily functioning with room for improvement.");
    } else if (analysis.overallScore >= 4) {
      insights.push("Your wellness scores suggest moderate daily functioning challenges.");
    } else if (analysis.overallScore > 0) {
      insights.push("Your wellness scores indicate significant daily functioning difficulties.");
    }

    // Trend insights
    if (trends.overallDirection === 'improving') {
      insights.push(`Your wellness is trending upward with a ${trends.weekOverWeek.toFixed(1)}% improvement this week.`);
    } else if (trends.overallDirection === 'declining') {
      insights.push(`Your wellness shows a declining trend with a ${Math.abs(trends.weekOverWeek).toFixed(1)}% decrease this week.`);
    }

    // Consistency insights
    if (trends.consistencyScore >= 80) {
      insights.push("Your wellness scores are very consistent, indicating stable daily functioning.");
    } else if (trends.consistencyScore < 60) {
      insights.push("Your wellness scores show high variability, which may indicate inconsistent sleep quality impacts.");
    }

    // Correlation insights
    const strongCorrelations: string[] = [];
    
    // Check sleep duration correlations
    if (correlations.sleepDuration.energy > 0.5) {
      strongCorrelations.push(`energy improves significantly with longer sleep (r=${correlations.sleepDuration.energy.toFixed(2)})`);
    }
    if (correlations.sleepDuration.alertness > 0.5) {
      strongCorrelations.push(`morning alertness strongly correlates with sleep duration (r=${correlations.sleepDuration.alertness.toFixed(2)})`);
    }
    if (correlations.sleepDuration.focus > 0.5) {
      strongCorrelations.push(`cognitive focus benefits from adequate sleep duration (r=${correlations.sleepDuration.focus.toFixed(2)})`);
    }

    // Check sleep efficiency correlations
    if (correlations.sleepEfficiency.alertness > 0.4) {
      strongCorrelations.push(`sleep efficiency strongly affects morning alertness (r=${correlations.sleepEfficiency.alertness.toFixed(2)})`);
    }
    if (correlations.sleepEfficiency.mood > 0.4) {
      strongCorrelations.push(`better sleep efficiency is associated with improved mood (r=${correlations.sleepEfficiency.mood.toFixed(2)})`);
    }

    // Check sleep latency correlations (negative correlations are concerning)
    if (correlations.sleepLatency.focus < -0.4) {
      strongCorrelations.push(`longer sleep onset time negatively impacts focus (r=${correlations.sleepLatency.focus.toFixed(2)})`);
    }

    if (strongCorrelations.length > 0) {
      insights.push(`Key correlations found: ${strongCorrelations.join(', ')}.`);
    }

    // Parameter-specific insights
    if (breakdown.morningAlertness.category === 'poor' && breakdown.morningAlertness.daysTracked >= 3) {
      insights.push("Low morning alertness may indicate insufficient sleep recovery or sleep efficiency issues.");
    }
    
    if (breakdown.daytimeFocus.category === 'poor' && breakdown.daytimeFocus.daysTracked >= 3) {
      insights.push("Poor cognitive focus scores may be related to sleep fragmentation or duration.");
    }

    return insights;
  }
}

/**
 * Wellness parameter descriptors for user interface
 */
export const WellnessParameterDescriptions = {
  morningAlertness: {
    name: "Morning Alertness",
    question: "How alert did you feel upon waking?",
    scale: "1 = Extremely groggy, 10 = Fully alert and refreshed",
    clinicalRelevance: "Morning alertness reflects sleep quality and recovery effectiveness"
  },
  daytimeEnergy: {
    name: "Daytime Energy",
    question: "Rate your overall energy throughout the day",
    scale: "1 = Completely exhausted, 10 = High energy all day",
    clinicalRelevance: "Energy levels indicate sleep's restorative impact on daily functioning"
  },
  daytimeFocus: {
    name: "Cognitive Focus", 
    question: "How was your concentration and focus ability?",
    scale: "1 = Couldn't concentrate at all, 10 = Sharp focus all day",
    clinicalRelevance: "Cognitive function is sensitive to sleep quality and duration"
  },
  daytimeMood: {
    name: "Daily Mood",
    question: "Rate your overall mood during the day",
    scale: "1 = Very irritable/low, 10 = Positive and stable mood",
    clinicalRelevance: "Mood stability is closely linked to sleep quality and circadian rhythm"
  }
} as const;