/**
 * Clinical Sleep Analysis System
 * Stanford Sleep Health Program Compliant Modules
 * 
 * This module provides comprehensive clinical sleep analysis tools
 * following Stanford sleep medicine standards and protocols.
 */

// Calculation Services
export * from './calculations';
export * from './wellness';

// Validation Services  
export {
  ClinicalValidator,
  type ValidationResult,
  type ValidationError, 
  type ValidationWarning,
  type ClinicalSleepEntryInput
} from './validation';
export {
  type ClinicalFlag as ValidationClinicalFlag
} from './validation';

// Program Management
export * from './program';

// Type Definitions for Clinical Sleep Entry
export type ClinicalSleepData = {
  // Core sleep timing
  date: Date;
  timeInBed: Date;
  sleepAttemptTime: Date;
  finalWakeTime: Date;
  outOfBedTime: Date;
  
  // Sleep architecture
  totalSleepHours: number;
  totalSleepMins: number;
  sleepLatencyHours: number;
  sleepLatencyMins: number;
  
  // Sleep disruptions
  nightAwakenings: number;
  awakeningDurHours: number;
  awakeningDurMins: number;
  earlyAwakening: boolean;
  earlyAwakeHours?: number;
  earlyAwakeMins?: number;
  
  // Subjective measures (Stanford scales)
  sleepQuality: number; // 1-5
  morningRestedness: number; // 1-4
  
  // Wellness metrics (1-10 scales)
  morningAlertness?: number;
  daytimeEnergy?: number;
  daytimeFocus?: number;
  daytimeMood?: number;
  
  // Previous day factors
  prevDayNapHours: number;
  prevDayNapMins: number;
  
  // Pre-sleep activities
  preSleepReading: boolean;
  preSleepTV: boolean;
  preSleepOther?: string;
  
  // Additional data
  sleepMedications?: string;
  comments?: string;
};

// Clinical Analysis Result
export interface ClinicalAnalysisResult {
  calculations: {
    sleepEfficiency: number;
    totalSleepTimeMinutes: number;
    sleepLatencyMinutes: number;
    awakeningDurationMinutes: number;
    timeInBedMinutes: number;
  };
  
  wellness: {
    overallScore: number;
    alertnessScore: number;
    energyScore: number;
    focusScore: number;
    moodScore: number;
    trend: 'improving' | 'stable' | 'declining';
    insights: string[];
  };
  
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    clinicalFlags: string[];
  };
  
  clinicalFlags: {
    sleepEfficiencyFlag?: 'LOW' | 'SUBOPTIMAL' | 'GOOD';
    sleepLatencyFlag?: 'OPTIMAL' | 'ELEVATED' | 'CONCERNING';
    awakeningsFlag?: 'NORMAL' | 'ELEVATED' | 'HIGH';
    qualityFlag?: 'POOR' | 'FAIR' | 'GOOD';
  };
}

// Stanford Sleep Diary Constants
export const STANFORD_CONSTANTS = {
  PROGRAM_DURATION_DAYS: 14,
  SCALES: {
    SLEEP_QUALITY: { min: 1, max: 5 },
    MORNING_RESTEDNESS: { min: 1, max: 4 },
    WELLNESS_METRICS: { min: 1, max: 10 }
  },
  CLINICAL_THRESHOLDS: {
    SLEEP_EFFICIENCY: {
      OPTIMAL: 85,
      ADEQUATE: 80,
      CONCERNING: 70
    },
    SLEEP_LATENCY_MINUTES: {
      NORMAL: 20,
      ELEVATED: 30,
      CONCERNING: 60
    },
    NIGHT_AWAKENINGS: {
      NORMAL: 2,
      ELEVATED: 3,
      CONCERNING: 5
    }
  }
} as const;