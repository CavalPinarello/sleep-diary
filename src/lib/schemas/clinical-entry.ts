/**
 * Zod Validation Schemas for Clinical Sleep Diary Entry
 * Stanford Sleep Health Program Compliant Form Validation
 * 
 * These schemas provide client-side and API-level validation
 * that complements the medical validation in clinical/validation.ts
 */

import { z } from 'zod';

// Stanford Scale Constraints
const STANFORD_SCALES = {
  SLEEP_QUALITY: { min: 1, max: 5 },
  MORNING_RESTEDNESS: { min: 1, max: 4 },
  WELLNESS_METRICS: { min: 1, max: 10 }
} as const;

// Base validation schemas
const dateSchema = z.string()
  .min(1, 'Date is required')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format');

const timeSchema = z.string()
  .min(1, 'Time is required')
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)');

const hourSchema = z.number()
  .min(0, 'Hours cannot be negative')
  .max(23, 'Hours cannot exceed 23')
  .int('Hours must be a whole number');

const minuteSchema = z.number()
  .min(0, 'Minutes cannot be negative')
  .max(59, 'Minutes cannot exceed 59')
  .int('Minutes must be a whole number');

const sleepDurationHourSchema = z.number()
  .min(0, 'Sleep hours cannot be negative')
  .max(24, 'Sleep hours cannot exceed 24')
  .int('Hours must be a whole number');

const countSchema = z.number()
  .min(0, 'Count cannot be negative')
  .int('Count must be a whole number');

// Stanford Scale Validators
const sleepQualitySchema = z.number()
  .min(STANFORD_SCALES.SLEEP_QUALITY.min, `Sleep quality minimum is ${STANFORD_SCALES.SLEEP_QUALITY.min}`)
  .max(STANFORD_SCALES.SLEEP_QUALITY.max, `Sleep quality maximum is ${STANFORD_SCALES.SLEEP_QUALITY.max}`)
  .int('Sleep quality must be a whole number');

const morningRestednessSchema = z.number()
  .min(STANFORD_SCALES.MORNING_RESTEDNESS.min, `Morning restedness minimum is ${STANFORD_SCALES.MORNING_RESTEDNESS.min}`)
  .max(STANFORD_SCALES.MORNING_RESTEDNESS.max, `Morning restedness maximum is ${STANFORD_SCALES.MORNING_RESTEDNESS.max}`)
  .int('Morning restedness must be a whole number');

const wellnessMetricSchema = z.number()
  .min(STANFORD_SCALES.WELLNESS_METRICS.min, `Wellness score minimum is ${STANFORD_SCALES.WELLNESS_METRICS.min}`)
  .max(STANFORD_SCALES.WELLNESS_METRICS.max, `Wellness score maximum is ${STANFORD_SCALES.WELLNESS_METRICS.max}`)
  .int('Wellness score must be a whole number')
  .optional();

// Step-specific validation schemas
export const eveningStepSchema = z.object({
  // Core date and timing
  date: dateSchema,
  timeInBed: timeSchema,
  sleepAttemptTime: timeSchema,
  
  // Pre-sleep activities
  preSleepReading: z.boolean(),
  preSleepTV: z.boolean(),
  preSleepOther: z.string().max(200, 'Other activities description too long').optional(),
  
  // Previous day factors
  prevDayNapHours: hourSchema,
  prevDayNapMins: minuteSchema,
  
  // Medications and substances
  sleepMedications: z.string()
    .max(300, 'Medications description too long')
    .optional()
}).refine((data) => {
  // Validate that sleep attempt time is after time in bed
  const timeInBed = new Date(`2000-01-01T${data.timeInBed}`);
  const sleepAttemptTime = new Date(`2000-01-01T${data.sleepAttemptTime}`);
  return sleepAttemptTime >= timeInBed;
}, {
  message: 'Sleep attempt time must be after getting into bed',
  path: ['sleepAttemptTime']
});

export const morningStepSchema = z.object({
  // Wake timing
  finalWakeTime: timeSchema,
  outOfBedTime: timeSchema,
  
  // Sleep duration
  totalSleepHours: sleepDurationHourSchema,
  totalSleepMins: minuteSchema,
  
  // Sleep latency
  sleepLatencyHours: hourSchema,
  sleepLatencyMins: minuteSchema,
  
  // Night awakenings
  nightAwakenings: countSchema.max(50, 'Too many awakenings reported'),
  awakeningDurHours: hourSchema,
  awakeningDurMins: minuteSchema,
  
  // Early awakening
  earlyAwakening: z.boolean(),
  earlyAwakeHours: hourSchema.optional(),
  earlyAwakeMins: minuteSchema.optional(),
  
  // Stanford subjective assessments
  sleepQuality: sleepQualitySchema,
  morningRestedness: morningRestednessSchema,
  
  // Additional notes
  comments: z.string()
    .max(1000, 'Comments too long')
    .optional()
}).refine((data) => {
  // Validate that out of bed time is after final wake time
  const finalWakeTime = new Date(`2000-01-01T${data.finalWakeTime}`);
  const outOfBedTime = new Date(`2000-01-01T${data.outOfBedTime}`);
  
  // Handle overnight sleep (final wake time could be next day)
  if (outOfBedTime < finalWakeTime) {
    outOfBedTime.setDate(outOfBedTime.getDate() + 1);
  }
  
  return outOfBedTime >= finalWakeTime;
}, {
  message: 'Out of bed time must be after final wake time',
  path: ['outOfBedTime']
}).refine((data) => {
  // If early awakening is checked, must provide hours or minutes
  if (data.earlyAwakening) {
    return (data.earlyAwakeHours && data.earlyAwakeHours > 0) || 
           (data.earlyAwakeMins && data.earlyAwakeMins > 0);
  }
  return true;
}, {
  message: 'Please specify how much earlier you woke up',
  path: ['earlyAwakeHours']
}).refine((data) => {
  // Total sleep time should be reasonable
  const totalMinutes = (data.totalSleepHours * 60) + data.totalSleepMins;
  return totalMinutes >= 60 && totalMinutes <= 960; // 1-16 hours
}, {
  message: 'Total sleep time must be between 1 and 16 hours',
  path: ['totalSleepHours']
});

export const wellnessStepSchema = z.object({
  // Wellness metrics (all optional but encouraged)
  morningAlertness: wellnessMetricSchema,
  daytimeEnergy: wellnessMetricSchema,
  daytimeFocus: wellnessMetricSchema,
  daytimeMood: wellnessMetricSchema
});

// Complete clinical entry schema (combines all steps)
export const clinicalEntrySchema = z.object({
  // Evening step
  date: dateSchema,
  timeInBed: timeSchema,
  sleepAttemptTime: timeSchema,
  preSleepReading: z.boolean(),
  preSleepTV: z.boolean(),
  preSleepOther: z.string().max(200).default(''),
  prevDayNapHours: hourSchema,
  prevDayNapMins: minuteSchema,
  sleepMedications: z.string().max(300).default(''),
  
  // Morning step
  finalWakeTime: timeSchema,
  outOfBedTime: timeSchema,
  totalSleepHours: sleepDurationHourSchema,
  totalSleepMins: minuteSchema,
  sleepLatencyHours: hourSchema,
  sleepLatencyMins: minuteSchema,
  nightAwakenings: countSchema.max(50),
  awakeningDurHours: hourSchema,
  awakeningDurMins: minuteSchema,
  earlyAwakening: z.boolean(),
  earlyAwakeHours: hourSchema.default(0),
  earlyAwakeMins: minuteSchema.default(0),
  sleepQuality: sleepQualitySchema,
  morningRestedness: morningRestednessSchema,
  comments: z.string().max(1000).default(''),
  
  // Wellness step
  morningAlertness: wellnessMetricSchema.default(5),
  daytimeEnergy: wellnessMetricSchema.default(5),
  daytimeFocus: wellnessMetricSchema.default(5),
  daytimeMood: wellnessMetricSchema.default(5)
}).refine((data) => {
  // Cross-step validations

  // Sleep timing logic across multiple fields
  const baseDate = new Date(data.date);
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + 1);
  const nextDateStr = nextDate.toISOString().split('T')[0];

  const timeInBed = new Date(`${data.date}T${data.timeInBed}`);
  const sleepAttemptTime = new Date(`${data.date}T${data.sleepAttemptTime}`);

  // Determine if wake times are on the next day (overnight sleep)
  const finalWakeTimeHour = parseInt(data.finalWakeTime.split(':')[0]);
  const sleepAttemptHour = parseInt(data.sleepAttemptTime.split(':')[0]);
  const isOvernightSleep = finalWakeTimeHour < sleepAttemptHour ||
    (finalWakeTimeHour === sleepAttemptHour && data.finalWakeTime < data.sleepAttemptTime);

  const finalWakeTime = new Date(`${isOvernightSleep ? nextDateStr : data.date}T${data.finalWakeTime}`);
  const outOfBedTime = new Date(`${isOvernightSleep ? nextDateStr : data.date}T${data.outOfBedTime}`);

  // Basic time sequence validation
  return sleepAttemptTime >= timeInBed &&
         finalWakeTime >= sleepAttemptTime &&
         outOfBedTime >= finalWakeTime;
}, {
  message: 'Sleep timing sequence is invalid',
  path: ['sleepAttemptTime']
}).refine((data) => {
  // Sleep efficiency validation (rough check)
  const baseDate = new Date(data.date);
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + 1);
  const nextDateStr = nextDate.toISOString().split('T')[0];

  const timeInBed = new Date(`${data.date}T${data.timeInBed}`);

  // Determine if this is overnight sleep
  const outOfBedHour = parseInt(data.outOfBedTime.split(':')[0]);
  const timeInBedHour = parseInt(data.timeInBed.split(':')[0]);
  const isOvernight = outOfBedHour < timeInBedHour ||
    (outOfBedHour === timeInBedHour && data.outOfBedTime <= data.timeInBed);

  const outOfBed = new Date(`${isOvernight ? nextDateStr : data.date}T${data.outOfBedTime}`);

  const timeInBedMinutes = (outOfBed.getTime() - timeInBed.getTime()) / (1000 * 60);
  const totalSleepMinutes = (data.totalSleepHours * 60) + data.totalSleepMins;

  // Sleep efficiency shouldn't exceed 100%
  return totalSleepMinutes <= timeInBedMinutes;
}, {
  message: 'Total sleep time cannot exceed time spent in bed',
  path: ['totalSleepHours']
}).refine((data) => {
  // Awakening consistency validation
  if (data.nightAwakenings === 0) {
    // If no awakenings, shouldn't have awakening duration
    return data.awakeningDurHours === 0 && data.awakeningDurMins === 0;
  }
  return true;
}, {
  message: 'Cannot have awakening duration without awakenings',
  path: ['awakeningDurHours']
});

// API request/response schemas
export const apiCreateClinicalEntrySchema = z.object({
  // Evening step
  date: dateSchema,
  timeInBed: timeSchema,
  sleepAttemptTime: timeSchema,
  preSleepReading: z.boolean(),
  preSleepTV: z.boolean(),
  preSleepOther: z.string().max(200).default(''),
  prevDayNapHours: hourSchema,
  prevDayNapMins: minuteSchema,
  sleepMedications: z.string().max(300).default(''),
  
  // Morning step
  finalWakeTime: timeSchema,
  outOfBedTime: timeSchema,
  totalSleepHours: sleepDurationHourSchema,
  totalSleepMins: minuteSchema,
  sleepLatencyHours: hourSchema,
  sleepLatencyMins: minuteSchema,
  nightAwakenings: countSchema.max(50),
  awakeningDurHours: hourSchema,
  awakeningDurMins: minuteSchema,
  earlyAwakening: z.boolean(),
  earlyAwakeHours: hourSchema.default(0),
  earlyAwakeMins: minuteSchema.default(0),
  sleepQuality: sleepQualitySchema,
  morningRestedness: morningRestednessSchema,
  comments: z.string().max(1000).default(''),
  
  // Wellness step
  morningAlertness: wellnessMetricSchema.default(5),
  daytimeEnergy: wellnessMetricSchema.default(5),
  daytimeFocus: wellnessMetricSchema.default(5),
  daytimeMood: wellnessMetricSchema.default(5),
  
  // Optional program association
  programId: z.string().optional()
});

export const apiClinicalEntryResponseSchema = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Include computed metrics
  sleepEfficiency: z.number().optional(),
  timeInBedDuration: z.number().optional(),
  // Validation results
  validationResult: z.object({
    isValid: z.boolean(),
    errors: z.array(z.object({
      field: z.string(),
      message: z.string()
    })),
    warnings: z.array(z.object({
      field: z.string(),
      message: z.string(),
      clinicalContext: z.string()
    })),
    clinicalFlags: z.array(z.object({
      type: z.string(),
      message: z.string(),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH'])
    }))
  }).optional()
});

// Type exports for use in components
export type EveningStepData = z.infer<typeof eveningStepSchema>;
export type MorningStepData = z.infer<typeof morningStepSchema>;
export type WellnessStepData = z.infer<typeof wellnessStepSchema>;
export type ClinicalEntryData = z.infer<typeof clinicalEntrySchema>;
export type ApiCreateClinicalEntry = z.infer<typeof apiCreateClinicalEntrySchema>;
export type ApiClinicalEntryResponse = z.infer<typeof apiClinicalEntryResponseSchema>;

// Validation helper functions
export const validateEveningStep = (data: unknown): data is EveningStepData => {
  try {
    eveningStepSchema.parse(data);
    return true;
  } catch {
    return false;
  }
};

export const validateMorningStep = (data: unknown): data is MorningStepData => {
  try {
    morningStepSchema.parse(data);
    return true;
  } catch {
    return false;
  }
};

export const validateWellnessStep = (data: unknown): data is WellnessStepData => {
  try {
    wellnessStepSchema.parse(data);
    return true;
  } catch {
    return false;
  }
};

export const validateClinicalEntry = (data: unknown): data is ClinicalEntryData => {
  try {
    clinicalEntrySchema.parse(data);
    return true;
  } catch {
    return false;
  }
};

// Form validation error extraction
export const extractValidationErrors = (error: z.ZodError) => {
  return error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code
  }));
};

// Stanford Scale Reference
export const STANFORD_SCALE_LABELS = {
  sleepQuality: {
    1: 'Very Poor',
    2: 'Poor', 
    3: 'Fair',
    4: 'Good',
    5: 'Very Good'
  },
  morningRestedness: {
    1: 'Not at All Rested',
    2: 'Slightly Rested',
    3: 'Moderately Rested', 
    4: 'Well Rested'
  },
  wellnessMetrics: {
    1: 'Very Poor',
    2: 'Poor',
    3: 'Below Average',
    4: 'Fair',
    5: 'Average',
    6: 'Above Average', 
    7: 'Good',
    8: 'Very Good',
    9: 'Excellent',
    10: 'Outstanding'
  }
} as const;