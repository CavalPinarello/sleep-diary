/**
 * Clinical Data Validation
 * Stanford Sleep Health Program Compliant Validation Rules
 * 
 * This module provides clinical-grade validation for all sleep parameters
 * with medical context and threshold-based warnings.
 */

import { ClinicalValidationRules } from './calculations';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  clinicalFlags: ClinicalFlag[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
  expectedRange?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  value: unknown;
  clinicalContext: string;
  severity: 'info' | 'caution' | 'concern';
}

export interface ClinicalFlag {
  type: string;
  field: string;
  message: string;
  clinicalRelevance: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedAction?: string;
}

export interface ClinicalSleepEntryInput {
  // Required fields
  date: Date;
  timeInBed: Date;
  sleepAttemptTime: Date;
  finalWakeTime: Date;
  outOfBedTime: Date;
  totalSleepHours: number;
  totalSleepMins: number;
  sleepQuality: number;
  morningRestedness: number;
  
  // Sleep latency
  sleepLatencyHours: number;
  sleepLatencyMins: number;
  
  // Night awakenings
  nightAwakenings: number;
  awakeningDurHours: number;
  awakeningDurMins: number;
  
  // Previous day factors
  prevDayNapHours: number;
  prevDayNapMins: number;
  
  // Pre-sleep activities
  preSleepReading: boolean;
  preSleepTV: boolean;
  preSleepOther?: string;
  
  // Early awakening
  earlyAwakening: boolean;
  earlyAwakeHours?: number;
  earlyAwakeMins?: number;
  
  // Wellness metrics (optional)
  morningAlertness?: number;
  daytimeEnergy?: number;
  daytimeFocus?: number;
  daytimeMood?: number;
  
  // Medications
  sleepMedications?: string; // JSON string
  
  // Notes
  comments?: string;
}

/**
 * Clinical validation service
 */
export class ClinicalValidator {
  /**
   * Validate complete clinical sleep entry
   */
  static validateSleepEntry(input: ClinicalSleepEntryInput): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const clinicalFlags: ClinicalFlag[] = [];

    // Date validations
    this.validateDates(input, errors, warnings);
    
    // Sleep duration validations
    this.validateSleepDuration(input, errors, warnings, clinicalFlags);
    
    // Sleep latency validations
    this.validateSleepLatency(input, errors, warnings, clinicalFlags);
    
    // Night awakenings validations
    this.validateNightAwakenings(input, errors, warnings, clinicalFlags);
    
    // Sleep quality validations
    this.validateSleepQuality(input, errors, warnings);
    
    // Wellness metrics validations
    this.validateWellnessMetrics(input, errors, warnings);
    
    // Sleep efficiency validation (calculated)
    this.validateSleepEfficiency(input, warnings, clinicalFlags);
    
    // Logical consistency checks
    this.validateLogicalConsistency(input, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      clinicalFlags
    };
  }

  /**
   * Validate date consistency and logic
   */
  private static validateDates(
    input: ClinicalSleepEntryInput,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const { date, timeInBed, sleepAttemptTime, finalWakeTime, outOfBedTime } = input;

    // Check if dates are valid
    if (isNaN(date.getTime())) {
      errors.push({
        field: 'date',
        message: 'Invalid date provided',
        value: date
      });
      return;
    }

    if (isNaN(timeInBed.getTime())) {
      errors.push({
        field: 'timeInBed',
        message: 'Invalid time in bed provided',
        value: timeInBed
      });
    }

    if (isNaN(sleepAttemptTime.getTime())) {
      errors.push({
        field: 'sleepAttemptTime',
        message: 'Invalid sleep attempt time provided',
        value: sleepAttemptTime
      });
    }

    if (isNaN(finalWakeTime.getTime())) {
      errors.push({
        field: 'finalWakeTime',
        message: 'Invalid final wake time provided',
        value: finalWakeTime
      });
    }

    if (isNaN(outOfBedTime.getTime())) {
      errors.push({
        field: 'outOfBedTime',
        message: 'Invalid out of bed time provided',
        value: outOfBedTime
      });
    }

    // Logical date sequence checks
    if (timeInBed >= sleepAttemptTime) {
      warnings.push({
        field: 'sleepAttemptTime',
        message: 'Sleep attempt time should be after getting into bed',
        value: sleepAttemptTime,
        clinicalContext: 'Stanford diary expects time attempting sleep to be after getting into bed',
        severity: 'caution'
      });
    }

    if (finalWakeTime <= sleepAttemptTime) {
      errors.push({
        field: 'finalWakeTime',
        message: 'Final wake time must be after sleep attempt time',
        value: finalWakeTime
      });
    }

    if (outOfBedTime < finalWakeTime) {
      errors.push({
        field: 'outOfBedTime',
        message: 'Out of bed time cannot be before final wake time',
        value: outOfBedTime
      });
    }

    // Check for unrealistic time spans
    const timeInBedDuration = (outOfBedTime.getTime() - timeInBed.getTime()) / (1000 * 60 * 60);
    if (timeInBedDuration > 16) {
      warnings.push({
        field: 'timeInBed',
        message: `Time in bed duration of ${timeInBedDuration.toFixed(1)} hours is unusually long`,
        value: timeInBedDuration,
        clinicalContext: 'Extended time in bed may indicate depression or other sleep disorders',
        severity: 'concern'
      });
    }
  }

  /**
   * Validate sleep duration parameters
   */
  private static validateSleepDuration(
    input: ClinicalSleepEntryInput,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    clinicalFlags: ClinicalFlag[]
  ): void {
    const { totalSleepHours, totalSleepMins } = input;
    const rules = ClinicalValidationRules.totalSleepTime;

    // Check valid ranges
    if (totalSleepHours < 0 || totalSleepHours > 23) {
      errors.push({
        field: 'totalSleepHours',
        message: 'Sleep hours must be between 0 and 23',
        value: totalSleepHours,
        expectedRange: '0-23 hours'
      });
    }

    if (totalSleepMins < 0 || totalSleepMins > 59) {
      errors.push({
        field: 'totalSleepMins',
        message: 'Sleep minutes must be between 0 and 59',
        value: totalSleepMins,
        expectedRange: '0-59 minutes'
      });
    }

    const totalSleepMinutes = (totalSleepHours * 60) + totalSleepMins;

    // Check clinical ranges
    if (totalSleepMinutes < rules.min) {
      errors.push({
        field: 'totalSleep',
        message: `Total sleep time of ${totalSleepMinutes} minutes is below minimum realistic value`,
        value: totalSleepMinutes,
        expectedRange: `${rules.min}-${rules.max} minutes`
      });
    }

    if (totalSleepMinutes > rules.max) {
      errors.push({
        field: 'totalSleep',
        message: `Total sleep time of ${totalSleepMinutes} minutes exceeds maximum realistic value`,
        value: totalSleepMinutes,
        expectedRange: `${rules.min}-${rules.max} minutes`
      });
    }

    // Clinical warnings
    if (totalSleepMinutes < rules.recommendedMin) {
      clinicalFlags.push({
        type: 'INSUFFICIENT_SLEEP',
        field: 'totalSleep',
        message: `Total sleep of ${(totalSleepMinutes / 60).toFixed(1)} hours is below recommended minimum`,
        clinicalRelevance: 'Chronic sleep restriction associated with health risks and impaired functioning',
        severity: totalSleepMinutes < 300 ? 'HIGH' : 'MEDIUM',
        recommendedAction: 'Consider sleep extension strategies and evaluation for sleep disorders'
      });
    }

    if (totalSleepMinutes > rules.optimalMax + 120) { // >11 hours
      warnings.push({
        field: 'totalSleep',
        message: `Total sleep of ${(totalSleepMinutes / 60).toFixed(1)} hours is unusually long`,
        value: totalSleepMinutes,
        clinicalContext: 'Excessive sleep may indicate depression, hypersomnia, or other medical conditions',
        severity: 'concern'
      });
    }
  }

  /**
   * Validate sleep onset latency
   */
  private static validateSleepLatency(
    input: ClinicalSleepEntryInput,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    clinicalFlags: ClinicalFlag[]
  ): void {
    const { sleepLatencyHours, sleepLatencyMins } = input;
    const rules = ClinicalValidationRules.sleepLatency;

    // Check valid ranges
    if (sleepLatencyHours < 0 || sleepLatencyMins < 0) {
      errors.push({
        field: 'sleepLatency',
        message: 'Sleep latency cannot be negative',
        value: { hours: sleepLatencyHours, minutes: sleepLatencyMins }
      });
    }

    if (sleepLatencyMins > 59) {
      errors.push({
        field: 'sleepLatencyMins',
        message: 'Sleep latency minutes must be 0-59',
        value: sleepLatencyMins,
        expectedRange: '0-59 minutes'
      });
    }

    const latencyMinutes = (sleepLatencyHours * 60) + sleepLatencyMins;

    if (latencyMinutes > rules.max) {
      warnings.push({
        field: 'sleepLatency',
        message: `Sleep latency of ${latencyMinutes} minutes is unusually long`,
        value: latencyMinutes,
        clinicalContext: 'Extreme sleep latency may indicate severe insomnia or other medical conditions',
        severity: 'concern'
      });
    }

    // Clinical thresholds
    if (latencyMinutes > rules.concernThreshold) {
      clinicalFlags.push({
        type: 'SLEEP_ONSET_INSOMNIA',
        field: 'sleepLatency',
        message: `Sleep latency of ${latencyMinutes} minutes indicates significant sleep onset difficulty`,
        clinicalRelevance: 'Sleep latency >60 minutes may indicate onset insomnia requiring evaluation',
        severity: 'HIGH',
        recommendedAction: 'Consider cognitive-behavioral therapy for insomnia (CBT-I) or medical evaluation'
      });
    } else if (latencyMinutes > rules.warningThreshold) {
      clinicalFlags.push({
        type: 'ELEVATED_SLEEP_LATENCY',
        field: 'sleepLatency',
        message: `Sleep latency of ${latencyMinutes} minutes is above normal range`,
        clinicalRelevance: 'Sleep latency >30 minutes may indicate difficulty initiating sleep',
        severity: 'MEDIUM',
        recommendedAction: 'Consider sleep hygiene improvements and stress management'
      });
    }
  }

  /**
   * Validate night awakenings
   */
  private static validateNightAwakenings(
    input: ClinicalSleepEntryInput,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    clinicalFlags: ClinicalFlag[]
  ): void {
    const { nightAwakenings, awakeningDurHours, awakeningDurMins } = input;
    const rules = ClinicalValidationRules.nightAwakenings;

    // Check valid ranges
    if (nightAwakenings < 0) {
      errors.push({
        field: 'nightAwakenings',
        message: 'Number of awakenings cannot be negative',
        value: nightAwakenings
      });
    }

    if (awakeningDurHours < 0 || awakeningDurMins < 0) {
      errors.push({
        field: 'awakeningDuration',
        message: 'Awakening duration cannot be negative',
        value: { hours: awakeningDurHours, minutes: awakeningDurMins }
      });
    }

    if (awakeningDurMins > 59) {
      errors.push({
        field: 'awakeningDurMins',
        message: 'Awakening duration minutes must be 0-59',
        value: awakeningDurMins,
        expectedRange: '0-59 minutes'
      });
    }

    // Logical consistency
    if (nightAwakenings === 0 && (awakeningDurHours > 0 || awakeningDurMins > 0)) {
      warnings.push({
        field: 'awakeningDuration',
        message: 'Awakening duration specified but no awakenings reported',
        value: { hours: awakeningDurHours, minutes: awakeningDurMins },
        clinicalContext: 'This may indicate confusion about awakening definition',
        severity: 'caution'
      });
    }

    if (nightAwakenings > 0 && awakeningDurHours === 0 && awakeningDurMins === 0) {
      warnings.push({
        field: 'awakeningDuration',
        message: 'Awakenings reported but no duration specified',
        value: nightAwakenings,
        clinicalContext: 'Brief awakenings may still impact sleep quality',
        severity: 'info'
      });
    }

    // Clinical thresholds
    if (nightAwakenings > rules.concernThreshold) {
      clinicalFlags.push({
        type: 'SLEEP_MAINTENANCE_INSOMNIA',
        field: 'nightAwakenings',
        message: `${nightAwakenings} awakenings per night indicates fragmented sleep`,
        clinicalRelevance: 'Frequent awakenings (>5) may indicate sleep maintenance issues',
        severity: 'HIGH',
        recommendedAction: 'Consider evaluation for sleep disorders (sleep apnea, periodic limb movements)'
      });
    } else if (nightAwakenings > rules.warningThreshold) {
      clinicalFlags.push({
        type: 'ELEVATED_AWAKENINGS',
        field: 'nightAwakenings',
        message: `${nightAwakenings} awakenings per night may affect sleep quality`,
        clinicalRelevance: 'Multiple awakenings (>3) can fragment sleep architecture',
        severity: 'MEDIUM',
        recommendedAction: 'Consider sleep environment optimization and stress management'
      });
    }
  }

  /**
   * Validate sleep quality ratings
   */
  private static validateSleepQuality(
    input: ClinicalSleepEntryInput,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const { sleepQuality, morningRestedness } = input;

    // Stanford sleep quality scale is 1-5
    if (sleepQuality < 1 || sleepQuality > 5) {
      errors.push({
        field: 'sleepQuality',
        message: 'Sleep quality must be rated 1-5 (Stanford scale)',
        value: sleepQuality,
        expectedRange: '1-5 (1=very poor, 5=very good)'
      });
    }

    // Stanford restedness scale is 1-4
    if (morningRestedness < 1 || morningRestedness > 4) {
      errors.push({
        field: 'morningRestedness',
        message: 'Morning restedness must be rated 1-4 (Stanford scale)',
        value: morningRestedness,
        expectedRange: '1-4 (1=not at all rested, 4=well rested)'
      });
    }

    // Consistency check
    if (sleepQuality === 1 && morningRestedness === 4) {
      warnings.push({
        field: 'consistency',
        message: 'Very poor sleep quality but well rested seems inconsistent',
        value: { quality: sleepQuality, restedness: morningRestedness },
        clinicalContext: 'Consider if ratings accurately reflect sleep experience',
        severity: 'caution'
      });
    }

    if (sleepQuality === 5 && morningRestedness === 1) {
      warnings.push({
        field: 'consistency',
        message: 'Very good sleep quality but not rested seems inconsistent',
        value: { quality: sleepQuality, restedness: morningRestedness },
        clinicalContext: 'May indicate sleep disorders despite subjective quality',
        severity: 'caution'
      });
    }
  }

  /**
   * Validate wellness metrics (1-10 scale)
   */
  private static validateWellnessMetrics(
    input: ClinicalSleepEntryInput,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const { morningAlertness, daytimeEnergy, daytimeFocus, daytimeMood } = input;
    const rules = ClinicalValidationRules.wellnessMetrics;

    const wellnessFields = [
      { name: 'morningAlertness', value: morningAlertness },
      { name: 'daytimeEnergy', value: daytimeEnergy },
      { name: 'daytimeFocus', value: daytimeFocus },
      { name: 'daytimeMood', value: daytimeMood }
    ];

    for (const field of wellnessFields) {
      if (field.value !== undefined && field.value !== null) {
        if (field.value < rules.min || field.value > rules.max) {
          errors.push({
            field: field.name,
            message: `${field.name} must be rated 1-10`,
            value: field.value,
            expectedRange: '1-10'
          });
        }

        if (field.value < rules.concernThreshold) {
          warnings.push({
            field: field.name,
            message: `Low ${field.name} score may indicate impaired functioning`,
            value: field.value,
            clinicalContext: 'Low wellness scores may reflect sleep impact on daily life',
            severity: 'concern'
          });
        }
      }
    }

    // Check for unusual patterns
    const validScores = wellnessFields
      .map(f => f.value)
      .filter((v): v is number => v !== undefined && v !== null && v >= rules.min && v <= rules.max);

    if (validScores.length >= 3) {
      const average = validScores.reduce((sum, val) => sum + val, 0) / validScores.length;
      const allLow = validScores.every(score => score <= 3);
      const allHigh = validScores.every(score => score >= 8);

      if (allLow) {
        warnings.push({
          field: 'wellnessPattern',
          message: 'All wellness scores are very low',
          value: average,
          clinicalContext: 'Uniformly low scores may indicate depression or severe sleep disorders',
          severity: 'concern'
        });
      }

      if (allHigh && input.sleepQuality <= 2) {
        warnings.push({
          field: 'wellnessPattern',
          message: 'High wellness scores despite poor sleep quality',
          value: average,
          clinicalContext: 'May indicate adaptation to chronic sleep issues or reporting bias',
          severity: 'info'
        });
      }
    }
  }

  /**
   * Validate calculated sleep efficiency
   */
  private static validateSleepEfficiency(
    input: ClinicalSleepEntryInput,
    warnings: ValidationWarning[],
    clinicalFlags: ClinicalFlag[]
  ): void {
    const { timeInBed, outOfBedTime, totalSleepHours, totalSleepMins } = input;
    
    const timeInBedMinutes = (outOfBedTime.getTime() - timeInBed.getTime()) / (1000 * 60);
    const totalSleepMinutes = (totalSleepHours * 60) + totalSleepMins;
    
    if (timeInBedMinutes > 0) {
      const sleepEfficiency = (totalSleepMinutes / timeInBedMinutes) * 100;
      const rules = ClinicalValidationRules.sleepEfficiency;

      if (sleepEfficiency > 100) {
        warnings.push({
          field: 'sleepEfficiency',
          message: 'Sleep efficiency cannot exceed 100% - check time entries',
          value: sleepEfficiency,
          clinicalContext: 'Total sleep time exceeds time in bed, indicating data entry error',
          severity: 'concern'
        });
      }

      if (sleepEfficiency < rules.concernThreshold) {
        clinicalFlags.push({
          type: 'LOW_SLEEP_EFFICIENCY',
          field: 'sleepEfficiency',
          message: `Sleep efficiency of ${sleepEfficiency.toFixed(1)}% is below clinical threshold`,
          clinicalRelevance: 'Sleep efficiency <80% may indicate sleep disorders requiring evaluation',
          severity: 'HIGH',
          recommendedAction: 'Consider sleep restriction therapy or medical evaluation'
        });
      } else if (sleepEfficiency < rules.optimalThreshold) {
        clinicalFlags.push({
          type: 'SUBOPTIMAL_SLEEP_EFFICIENCY',
          field: 'sleepEfficiency',
          message: `Sleep efficiency of ${sleepEfficiency.toFixed(1)}% is below optimal range`,
          clinicalRelevance: 'Sleep efficiency 80-85% may benefit from sleep hygiene improvements',
          severity: 'MEDIUM',
          recommendedAction: 'Consider sleep hygiene optimization and consistent sleep schedule'
        });
      }
    }
  }

  /**
   * Validate logical consistency across parameters
   */
  private static validateLogicalConsistency(
    input: ClinicalSleepEntryInput,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const { totalSleepHours, totalSleepMins, nightAwakenings, awakeningDurHours, awakeningDurMins } = input;
    
    const totalSleepMinutes = (totalSleepHours * 60) + totalSleepMins;
    const totalAwakeningMinutes = (awakeningDurHours * 60) + awakeningDurMins;

    // Check if awakening time is reasonable compared to sleep time
    if (totalAwakeningMinutes > totalSleepMinutes / 2) {
      warnings.push({
        field: 'consistency',
        message: 'Awakening duration is more than half of total sleep time',
        value: { awakeningMins: totalAwakeningMinutes, sleepMins: totalSleepMinutes },
        clinicalContext: 'This may indicate severe sleep fragmentation or measurement error',
        severity: 'concern'
      });
    }

    // Check awakening frequency vs duration consistency
    if (nightAwakenings > 0 && totalAwakeningMinutes > 0) {
      const averageAwakeningDuration = totalAwakeningMinutes / nightAwakenings;
      
      if (averageAwakeningDuration > 60) {
        warnings.push({
          field: 'awakeningPattern',
          message: `Average awakening duration of ${averageAwakeningDuration.toFixed(1)} minutes is very long`,
          value: averageAwakeningDuration,
          clinicalContext: 'Long individual awakenings may indicate anxiety or other sleep disorders',
          severity: 'caution'
        });
      }

      if (averageAwakeningDuration < 1 && nightAwakenings > 5) {
        warnings.push({
          field: 'awakeningPattern',
          message: 'Many very brief awakenings may indicate sleep fragmentation',
          value: { count: nightAwakenings, avgDuration: averageAwakeningDuration },
          clinicalContext: 'Frequent brief awakenings may suggest sleep apnea or periodic limb movements',
          severity: 'caution'
        });
      }
    }
  }
}