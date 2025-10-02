/**
 * Clinical Sleep Calculations
 * Stanford Sleep Health and Insomnia Program Compliant
 * 
 * This module provides clinical-grade calculations for sleep metrics
 * including sleep efficiency, latency, wellness scoring, and threshold monitoring.
 */

export interface ClinicalMetrics {
  sleepEfficiency: number;
  sleepLatencyMinutes: number;
  totalAwakeningDuration: number;
  timeInBedMinutes: number;
  totalSleepMinutes: number;
  wellnessScore?: number; // Average of 4 wellness metrics
  nightAwakenings: number;
}

export interface ClinicalFlag {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  clinicalRelevance: string;
  threshold?: number;
}

export interface WellnessMetrics {
  morningAlertness?: number;
  daytimeEnergy?: number;
  daytimeFocus?: number;
  daytimeMood?: number;
}

/**
 * Core clinical calculations following Stanford Sleep Health Program standards
 */
export class ClinicalCalculations {
  /**
   * Calculate sleep efficiency percentage
   * Formula: (Total Sleep Time / Time in Bed) × 100
   * Clinical significance: >85% = normal, 80-85% = concerning, <80% = poor
   */
  static calculateSleepEfficiency(
    totalSleepMinutes: number,
    timeInBedMinutes: number
  ): number {
    if (timeInBedMinutes === 0) return 0;
    const efficiency = (totalSleepMinutes / timeInBedMinutes) * 100;
    return Math.min(100, Math.max(0, efficiency)); // Clamp between 0-100
  }

  /**
   * Convert sleep latency to minutes for analysis
   * Stanford Q4: How long did it take you to fall asleep?
   */
  static calculateSleepLatency(hours: number, minutes: number): number {
    return (hours * 60) + minutes;
  }

  /**
   * Calculate total awakening duration in minutes
   * Stanford Q6: In total, how long did these awakenings last?
   */
  static calculateTotalAwakeningDuration(hours: number, minutes: number): number {
    return (hours * 60) + minutes;
  }

  /**
   * Calculate time in bed duration in minutes
   * From time got into bed to time got out of bed
   */
  static calculateTimeInBed(timeInBed: Date, outOfBedTime: Date): number {
    const diffMs = outOfBedTime.getTime() - timeInBed.getTime();
    return Math.max(0, diffMs / (1000 * 60)); // Convert to minutes
  }

  /**
   * Calculate total sleep time in minutes
   * Stanford Q10: In total, how long did you sleep?
   */
  static calculateTotalSleepTime(hours: number, minutes: number): number {
    return (hours * 60) + minutes;
  }

  /**
   * Calculate comprehensive wellness score from subjective metrics
   * Average of: Morning Alertness, Daytime Energy, Cognitive Focus, Daily Mood
   * All rated 1-10, higher is better
   */
  static calculateWellnessScore(metrics: WellnessMetrics): number | undefined {
    const { morningAlertness, daytimeEnergy, daytimeFocus, daytimeMood } = metrics;
    const values = [morningAlertness, daytimeEnergy, daytimeFocus, daytimeMood]
      .filter((v): v is number => v !== undefined && v !== null);
    
    if (values.length === 0) return undefined;
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    return parseFloat((sum / values.length).toFixed(1));
  }

  /**
   * Calculate comprehensive clinical metrics from sleep entry
   */
  static calculateAllMetrics(entry: {
    timeInBed: Date;
    outOfBedTime: Date;
    totalSleepHours: number;
    totalSleepMins: number;
    sleepLatencyHours: number;
    sleepLatencyMins: number;
    awakeningDurHours: number;
    awakeningDurMins: number;
    nightAwakenings: number;
    morningAlertness?: number;
    daytimeEnergy?: number;
    daytimeFocus?: number;
    daytimeMood?: number;
  }): ClinicalMetrics {
    const timeInBedMinutes = this.calculateTimeInBed(entry.timeInBed, entry.outOfBedTime);
    const totalSleepMinutes = this.calculateTotalSleepTime(entry.totalSleepHours, entry.totalSleepMins);
    const sleepLatencyMinutes = this.calculateSleepLatency(entry.sleepLatencyHours, entry.sleepLatencyMins);
    const totalAwakeningDuration = this.calculateTotalAwakeningDuration(
      entry.awakeningDurHours, 
      entry.awakeningDurMins
    );
    const sleepEfficiency = this.calculateSleepEfficiency(totalSleepMinutes, timeInBedMinutes);
    const wellnessScore = this.calculateWellnessScore({
      morningAlertness: entry.morningAlertness,
      daytimeEnergy: entry.daytimeEnergy,
      daytimeFocus: entry.daytimeFocus,
      daytimeMood: entry.daytimeMood
    });

    return {
      sleepEfficiency,
      sleepLatencyMinutes,
      totalAwakeningDuration,
      timeInBedMinutes,
      totalSleepMinutes,
      wellnessScore,
      nightAwakenings: entry.nightAwakenings
    };
  }

  /**
   * Identify clinical concerns based on sleep medicine standards
   * Returns array of clinical flags for healthcare attention
   */
  static flagClinicalConcerns(metrics: ClinicalMetrics): ClinicalFlag[] {
    const flags: ClinicalFlag[] = [];

    // Sleep Efficiency Assessment
    if (metrics.sleepEfficiency < 80) {
      flags.push({
        type: 'SLEEP_EFFICIENCY_LOW',
        severity: 'HIGH',
        message: `Sleep efficiency at ${metrics.sleepEfficiency.toFixed(1)}% is below clinical threshold`,
        clinicalRelevance: 'Sleep efficiency <80% may indicate sleep disorders requiring evaluation',
        threshold: 80
      });
    } else if (metrics.sleepEfficiency < 85) {
      flags.push({
        type: 'SLEEP_EFFICIENCY_CONCERNING',
        severity: 'MEDIUM',
        message: `Sleep efficiency at ${metrics.sleepEfficiency.toFixed(1)}% is below optimal range`,
        clinicalRelevance: 'Sleep efficiency 80-85% may benefit from sleep hygiene improvements',
        threshold: 85
      });
    }

    // Sleep Onset Latency Assessment
    if (metrics.sleepLatencyMinutes > 60) {
      flags.push({
        type: 'SLEEP_LATENCY_HIGH',
        severity: 'HIGH',
        message: `Sleep onset latency of ${metrics.sleepLatencyMinutes} minutes is significantly elevated`,
        clinicalRelevance: 'Sleep latency >60 minutes may indicate onset insomnia',
        threshold: 60
      });
    } else if (metrics.sleepLatencyMinutes > 30) {
      flags.push({
        type: 'SLEEP_LATENCY_ELEVATED',
        severity: 'MEDIUM',
        message: `Sleep onset latency of ${metrics.sleepLatencyMinutes} minutes is above normal`,
        clinicalRelevance: 'Sleep latency >30 minutes may indicate difficulty initiating sleep',
        threshold: 30
      });
    }

    // Night Awakening Assessment
    if (metrics.nightAwakenings > 5) {
      flags.push({
        type: 'AWAKENINGS_FREQUENT',
        severity: 'HIGH',
        message: `${metrics.nightAwakenings} awakenings per night indicates fragmented sleep`,
        clinicalRelevance: 'Frequent awakenings (>5) may indicate sleep maintenance issues',
        threshold: 5
      });
    } else if (metrics.nightAwakenings > 3) {
      flags.push({
        type: 'AWAKENINGS_ELEVATED',
        severity: 'MEDIUM',
        message: `${metrics.nightAwakenings} awakenings per night is above optimal`,
        clinicalRelevance: 'Multiple awakenings (>3) may affect sleep quality',
        threshold: 3
      });
    }

    // Total Sleep Time Assessment
    if (metrics.totalSleepMinutes < 300) { // <5 hours
      flags.push({
        type: 'SLEEP_DURATION_INSUFFICIENT',
        severity: 'HIGH',
        message: `Total sleep time of ${(metrics.totalSleepMinutes / 60).toFixed(1)} hours is insufficient`,
        clinicalRelevance: 'Sleep duration <5 hours associated with health risks',
        threshold: 300
      });
    } else if (metrics.totalSleepMinutes < 360) { // <6 hours
      flags.push({
        type: 'SLEEP_DURATION_SHORT',
        severity: 'MEDIUM',
        message: `Total sleep time of ${(metrics.totalSleepMinutes / 60).toFixed(1)} hours is below recommended`,
        clinicalRelevance: 'Sleep duration <6 hours may impact daily functioning',
        threshold: 360
      });
    }

    // Wellness Score Assessment (if available)
    if (metrics.wellnessScore !== undefined) {
      if (metrics.wellnessScore < 4) {
        flags.push({
          type: 'WELLNESS_SCORE_LOW',
          severity: 'MEDIUM',
          message: `Overall wellness score of ${metrics.wellnessScore}/10 suggests impaired functioning`,
          clinicalRelevance: 'Low wellness scores may indicate sleep impact on daily life',
          threshold: 4
        });
      }
    }

    return flags;
  }

  /**
   * Convert Stanford 1-5 sleep quality scale to 1-10 display scale
   * Stanford uses 1=very poor, 5=very good
   * Display uses 1=very poor, 10=excellent for better granularity
   */
  static convertStanfordQualityToDisplay(stanfordRating: number): number {
    // Linear scaling: Stanford 1-5 → Display 1-10
    return Math.round(((stanfordRating - 1) * 9 / 4) + 1);
  }

  /**
   * Convert display 1-10 scale back to Stanford 1-5 for clinical consistency
   */
  static convertDisplayQualityToStanford(displayRating: number): number {
    // Reverse linear scaling: Display 1-10 → Stanford 1-5
    return Math.round(((displayRating - 1) * 4 / 9) + 1);
  }

  /**
   * Calculate sleep debt/surplus over a period
   * Target is typically 8 hours, but can be customized
   */
  static calculateSleepDebt(
    entries: { totalSleepHours: number; totalSleepMins: number }[],
    targetHoursPerNight: number = 8
  ): {
    totalDebt: number; // Negative = debt, Positive = surplus
    averageDebt: number;
    nights: number;
  } {
    if (entries.length === 0) {
      return { totalDebt: 0, averageDebt: 0, nights: 0 };
    }

    const targetMinutes = targetHoursPerNight * 60;
    let totalDifference = 0;

    for (const entry of entries) {
      const actualMinutes = (entry.totalSleepHours * 60) + entry.totalSleepMins;
      totalDifference += (actualMinutes - targetMinutes);
    }

    return {
      totalDebt: totalDifference / 60, // Convert back to hours
      averageDebt: totalDifference / (entries.length * 60),
      nights: entries.length
    };
  }
}

/**
 * Clinical validation rules based on sleep medicine standards
 */
export const ClinicalValidationRules = {
  sleepLatency: {
    min: 0,
    max: 180, // 3 hours maximum realistic
    warningThreshold: 30, // >30 min may indicate insomnia
    concernThreshold: 60  // >60 min high concern
  },
  sleepEfficiency: {
    min: 0,
    max: 100,
    optimalThreshold: 85, // >85% is optimal
    concernThreshold: 80  // <80% is concerning
  },
  nightAwakenings: {
    min: 0,
    max: 15, // Maximum realistic
    warningThreshold: 3, // >3 may indicate maintenance issues
    concernThreshold: 5  // >5 is concerning
  },
  totalSleepTime: {
    min: 60, // 1 hour minimum
    max: 960, // 16 hours maximum
    recommendedMin: 360, // 6 hours recommended minimum
    optimalMin: 420, // 7 hours optimal minimum
    optimalMax: 540  // 9 hours optimal maximum
  },
  wellnessMetrics: {
    min: 1,
    max: 10,
    concernThreshold: 4, // <4 indicates impaired functioning
    optimalThreshold: 7  // >7 indicates good functioning
  }
} as const;

/**
 * Type for clinical validation rules
 */
export type ClinicalValidationRule = typeof ClinicalValidationRules[keyof typeof ClinicalValidationRules];