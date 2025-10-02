/**
 * Sleep Program Management
 * Stanford Sleep Health Program 2-Week Clinical Protocol
 * 
 * This module manages the two-week structured sleep diary programs
 * following Stanford clinical guidelines for sleep assessment.
 */

import { prisma } from '../db';
import type { SleepProgram, ClinicalSleepEntry } from '../../generated/prisma';

export interface ProgramProgress {
  totalDays: number;
  completedDays: number;
  consecutiveDays: number;
  completionPercentage: number;
  daysRemaining: number;
  isComplete: boolean;
  currentStreak: number;
  longestStreak: number;
}

export interface ProgramStatistics {
  progress: ProgramProgress;
  clinicalMetrics: {
    averageSleepEfficiency: number;
    averageSleepLatency: number;
    averageNightAwakenings: number;
    averageTotalSleepTime: number;
    averageSleepQuality: number;
    averageWellnessScore: number;
  };
  adherenceMetrics: {
    onTimeEntries: number;
    lateEntries: number;
    missedDays: number;
    dataQualityScore: number;
  };
}

export interface ProgramRecommendations {
  immediate: string[];
  clinical: string[];
  lifestyle: string[];
  followUp: string[];
}

export type ProgramStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'DISCONTINUED';

/**
 * Sleep Program management service
 */
export class SleepProgramService {
  /**
   * Create a new 2-week Stanford sleep program for a user
   */
  static async createProgram(
    userId: string,
    programName?: string
  ): Promise<SleepProgram> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 13); // 14 days total (0-13)

    const program = await prisma.sleepProgram.create({
      data: {
        userId,
        name: programName || `Stanford Sleep Diary - ${startDate.toLocaleDateString()}`,
        startDate,
        endDate,
        status: 'ACTIVE',
        targetDays: 14,
        instructions: this.getStanfordInstructions(),
        clinicalGoals: this.getDefaultClinicalGoals(),
        metadata: JSON.stringify({
          protocolVersion: 'Stanford-2024',
          createdBy: 'system',
          expectedCompletionRate: 0.85
        })
      }
    });

    return program;
  }

  /**
   * Get active program for user
   */
  static async getActiveProgram(userId: string): Promise<SleepProgram | null> {
    const activeProgram = await prisma.sleepProgram.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return activeProgram;
  }

  /**
   * Get program with entries
   */
  static async getProgramWithEntries(
    programId: string
  ): Promise<(SleepProgram & { entries: ClinicalSleepEntry[] }) | null> {
    const program = await prisma.sleepProgram.findUnique({
      where: { id: programId },
      include: {
        entries: {
          orderBy: { date: 'asc' }
        }
      }
    });

    return program;
  }

  /**
   * Calculate detailed program progress and statistics
   */
  static async calculateProgramStatistics(
    programId: string
  ): Promise<ProgramStatistics> {
    const program = await this.getProgramWithEntries(programId);
    
    if (!program) {
      throw new Error('Program not found');
    }

    const progress = this.calculateProgress(program);
    const clinicalMetrics = this.calculateClinicalMetrics(program.entries);
    const adherenceMetrics = this.calculateAdherenceMetrics(program);

    return {
      progress,
      clinicalMetrics,
      adherenceMetrics
    };
  }

  /**
   * Get personalized recommendations based on program data
   */
  static async getProgramRecommendations(
    programId: string
  ): Promise<ProgramRecommendations> {
    const program = await this.getProgramWithEntries(programId);
    
    if (!program) {
      throw new Error('Program not found');
    }

    const statistics = await this.calculateProgramStatistics(programId);
    
    return this.generateRecommendations(statistics, program.entries);
  }

  /**
   * Update program status
   */
  static async updateProgramStatus(
    programId: string,
    status: ProgramStatus,
    notes?: string
  ): Promise<SleepProgram> {
    const updateData: {
      status: ProgramStatus;
      updatedAt: Date;
      completedAt?: Date;
      notes?: string;
    } = {
      status,
      updatedAt: new Date()
    };

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    if (notes) {
      updateData.notes = notes;
    }

    return await prisma.sleepProgram.update({
      where: { id: programId },
      data: updateData
    });
  }

  /**
   * Check if program should auto-complete
   */
  static async checkProgramCompletion(programId: string): Promise<boolean> {
    const program = await this.getProgramWithEntries(programId);
    
    if (!program || program.status !== 'ACTIVE') {
      return false;
    }

    const progress = this.calculateProgress(program);
    
    // Auto-complete if we've reached the end date or have 14 entries
    if (progress.isComplete && progress.completedDays >= 14) {
      await this.updateProgramStatus(programId, 'COMPLETED', 'Auto-completed after 14 days');
      return true;
    }

    // Check if past end date with reasonable completion
    const now = new Date();
    const daysPastEnd = Math.floor((now.getTime() - program.endDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysPastEnd > 3 && progress.completedDays >= 10) {
      await this.updateProgramStatus(
        programId, 
        'COMPLETED', 
        `Auto-completed with ${progress.completedDays} days after grace period`
      );
      return true;
    }

    return false;
  }

  /**
   * Get all programs for a user
   */
  static async getUserPrograms(userId: string): Promise<SleepProgram[]> {
    return await prisma.sleepProgram.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { entries: true }
        }
      }
    });
  }

  /**
   * Calculate program progress
   */
  private static calculateProgress(
    program: SleepProgram & { entries: ClinicalSleepEntry[] }
  ): ProgramProgress {
    const totalDays = program.targetDays;
    const completedDays = program.entries.length;
    const completionPercentage = (completedDays / totalDays) * 100;
    const daysRemaining = Math.max(0, totalDays - completedDays);
    const isComplete = completedDays >= totalDays;

    // Calculate consecutive days and streaks
    const sortedEntries = program.entries
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let consecutiveDays = 0;

    if (sortedEntries.length > 0) {
      let streak = 1;
      longestStreak = 1;

      // Check if latest entry is recent (within 2 days)
      const latestEntry = sortedEntries[sortedEntries.length - 1];
      const daysSinceLatest = Math.floor(
        (Date.now() - latestEntry.date.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLatest <= 2) {
        currentStreak = 1;
      }

      // Calculate consecutive days from start
      const expectedDate = new Date(program.startDate);
      for (const entry of sortedEntries) {
        const entryDateStr = entry.date.toDateString();
        const expectedDateStr = expectedDate.toDateString();
        
        if (entryDateStr === expectedDateStr) {
          consecutiveDays++;
          expectedDate.setDate(expectedDate.getDate() + 1);
        } else {
          break;
        }
      }

      // Calculate all streaks
      for (let i = 1; i < sortedEntries.length; i++) {
        const current = sortedEntries[i];
        const previous = sortedEntries[i - 1];
        
        const daysBetween = Math.floor(
          (current.date.getTime() - previous.date.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysBetween === 1) {
          streak++;
          if (i === sortedEntries.length - 1 && daysSinceLatest <= 2) {
            currentStreak = streak;
          }
        } else {
          longestStreak = Math.max(longestStreak, streak);
          streak = 1;
        }
      }
      
      longestStreak = Math.max(longestStreak, streak);
    }

    return {
      totalDays,
      completedDays,
      consecutiveDays,
      completionPercentage: Math.round(completionPercentage * 10) / 10,
      daysRemaining,
      isComplete,
      currentStreak,
      longestStreak
    };
  }

  /**
   * Calculate clinical metrics from entries
   */
  private static calculateClinicalMetrics(entries: ClinicalSleepEntry[]) {
    if (entries.length === 0) {
      return {
        averageSleepEfficiency: 0,
        averageSleepLatency: 0,
        averageNightAwakenings: 0,
        averageTotalSleepTime: 0,
        averageSleepQuality: 0,
        averageWellnessScore: 0
      };
    }

    const metrics = entries.reduce(
      (acc, entry) => {
        // Calculate sleep efficiency
        const timeInBedMinutes = (entry.outOfBedTime.getTime() - entry.timeInBed.getTime()) / (1000 * 60);
        const totalSleepMinutes = (entry.totalSleepHours * 60) + entry.totalSleepMins;
        const sleepEfficiency = timeInBedMinutes > 0 ? (totalSleepMinutes / timeInBedMinutes) * 100 : 0;

        // Calculate sleep latency in minutes
        const sleepLatencyMinutes = (entry.sleepLatencyHours * 60) + entry.sleepLatencyMins;

        // Calculate wellness score (if available)
        const wellnessScores = [
          entry.morningAlertness,
          entry.daytimeEnergy,
          entry.daytimeFocus,
          entry.daytimeMood
        ].filter((score): score is number => score !== null);

        const wellnessScore = wellnessScores.length > 0 
          ? wellnessScores.reduce((sum, score) => sum + score, 0) / wellnessScores.length
          : 0;

        acc.sleepEfficiency += sleepEfficiency;
        acc.sleepLatency += sleepLatencyMinutes;
        acc.nightAwakenings += entry.nightAwakenings;
        acc.totalSleepTime += totalSleepMinutes;
        acc.sleepQuality += entry.sleepQuality;
        acc.wellnessScore += wellnessScore;

        return acc;
      },
      {
        sleepEfficiency: 0,
        sleepLatency: 0,
        nightAwakenings: 0,
        totalSleepTime: 0,
        sleepQuality: 0,
        wellnessScore: 0
      }
    );

    const count = entries.length;
    
    return {
      averageSleepEfficiency: Math.round((metrics.sleepEfficiency / count) * 10) / 10,
      averageSleepLatency: Math.round((metrics.sleepLatency / count) * 10) / 10,
      averageNightAwakenings: Math.round((metrics.nightAwakenings / count) * 10) / 10,
      averageTotalSleepTime: Math.round((metrics.totalSleepTime / count) * 10) / 10,
      averageSleepQuality: Math.round((metrics.sleepQuality / count) * 10) / 10,
      averageWellnessScore: Math.round((metrics.wellnessScore / count) * 10) / 10
    };
  }

  /**
   * Calculate adherence metrics
   */
  private static calculateAdherenceMetrics(
    program: SleepProgram & { entries: ClinicalSleepEntry[] }
  ) {
    const entries = program.entries;
    const totalExpectedEntries = Math.min(
      program.targetDays,
      Math.floor((Date.now() - program.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );

    let onTimeEntries = 0;
    let lateEntries = 0;

    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const createdDate = new Date(entry.createdAt);
      const daysDifference = Math.floor(
        (createdDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDifference <= 1) {
        onTimeEntries++;
      } else {
        lateEntries++;
      }
    });

    const missedDays = Math.max(0, totalExpectedEntries - entries.length);
    
    // Data quality score based on completeness of optional fields
    let totalOptionalFields = 0;
    let completedOptionalFields = 0;

    entries.forEach(entry => {
      const optionalFields = [
        entry.morningAlertness,
        entry.daytimeEnergy,
        entry.daytimeFocus,
        entry.daytimeMood,
        entry.preSleepOther,
        entry.comments,
        entry.sleepMedications
      ];

      totalOptionalFields += optionalFields.length;
      completedOptionalFields += optionalFields.filter(field => 
        field !== null && field !== undefined && field !== ''
      ).length;
    });

    const dataQualityScore = totalOptionalFields > 0 
      ? Math.round((completedOptionalFields / totalOptionalFields) * 100) 
      : 100;

    return {
      onTimeEntries,
      lateEntries,
      missedDays,
      dataQualityScore
    };
  }

  /**
   * Generate personalized recommendations
   */
  private static generateRecommendations(
    statistics: ProgramStatistics,
    _entries: ClinicalSleepEntry[]
  ): ProgramRecommendations {
    const immediate: string[] = [];
    const clinical: string[] = [];
    const lifestyle: string[] = [];
    const followUp: string[] = [];

    const { clinicalMetrics, progress, adherenceMetrics } = statistics;

    // Sleep efficiency recommendations
    if (clinicalMetrics.averageSleepEfficiency < 80) {
      clinical.push('Sleep efficiency below 80% may indicate sleep disorders - consider medical evaluation');
      lifestyle.push('Practice sleep restriction: limit time in bed to actual sleep time + 30 minutes');
    } else if (clinicalMetrics.averageSleepEfficiency < 85) {
      lifestyle.push('Optimize sleep efficiency with consistent sleep schedule and bedroom environment');
    }

    // Sleep latency recommendations
    if (clinicalMetrics.averageSleepLatency > 30) {
      immediate.push('Consider relaxation techniques before bedtime to reduce sleep onset time');
      lifestyle.push('Establish consistent pre-sleep routine 30-60 minutes before bedtime');
      
      if (clinicalMetrics.averageSleepLatency > 60) {
        clinical.push('Sleep latency over 60 minutes may indicate insomnia - consider CBT-I or medical consultation');
      }
    }

    // Night awakenings recommendations
    if (clinicalMetrics.averageNightAwakenings > 3) {
      lifestyle.push('Optimize sleep environment: temperature, noise, light control');
      lifestyle.push('Avoid large meals, alcohol, and excessive fluids 3 hours before bedtime');
      
      if (clinicalMetrics.averageNightAwakenings > 5) {
        clinical.push('Frequent night awakenings may indicate sleep apnea or other disorders - consider sleep study');
      }
    }

    // Sleep quality recommendations
    if (clinicalMetrics.averageSleepQuality < 3) {
      immediate.push('Focus on sleep hygiene: regular schedule, comfortable environment, pre-sleep routine');
      lifestyle.push('Consider factors affecting sleep quality: stress, caffeine, exercise timing');
    }

    // Adherence recommendations
    if (adherenceMetrics.missedDays > 3) {
      immediate.push('Set daily reminders to complete sleep diary entries consistently');
      immediate.push('Consider tracking sleep with smartphone apps or wearables as backup');
    }

    if (adherenceMetrics.dataQualityScore < 70) {
      immediate.push('Try to complete optional wellness metrics for better insights');
    }

    // Progress-based recommendations
    if (progress.completionPercentage > 80 && progress.daysRemaining <= 3) {
      followUp.push('Schedule follow-up consultation to review 2-week sleep patterns');
      followUp.push('Consider continued sleep diary tracking for ongoing monitoring');
    }

    // Wellness-based recommendations
    if (clinicalMetrics.averageWellnessScore > 0 && clinicalMetrics.averageWellnessScore < 6) {
      lifestyle.push('Low daytime wellness scores suggest sleep impact - focus on sleep quality improvements');
      clinical.push('Consider evaluation for mood disorders if low energy and mood persist');
    }

    return { immediate, clinical, lifestyle, followUp };
  }

  /**
   * Get Stanford clinical instructions
   */
  private static getStanfordInstructions(): string {
    return `
Stanford Sleep Health Program - 2-Week Clinical Sleep Diary

INSTRUCTIONS FOR USE:
Complete this diary every morning within 1-2 hours of waking up. Answer questions based on the previous night's sleep.

TIMING GUIDELINES:
- Time in Bed: When you got into bed with intention to sleep
- Sleep Attempt Time: When you actually tried to fall asleep
- Sleep Latency: Time from attempting sleep to actually falling asleep
- Night Awakenings: Number of times you woke up after initially falling asleep
- Final Wake Time: Last time you woke up before getting out of bed
- Out of Bed Time: When you finally got out of bed for the day

RATING SCALES:
- Sleep Quality: 1 (very poor) to 5 (very good)
- Morning Restedness: 1 (not at all rested) to 4 (well rested)
- Wellness Metrics: 1 (very poor) to 10 (excellent)

IMPORTANT NOTES:
- Complete entries consistently for accurate assessment
- Be honest in your responses - this aids clinical evaluation
- Contact your healthcare provider with any concerns
- This diary helps identify sleep patterns and potential disorders
    `.trim();
  }

  /**
   * Get default clinical goals
   */
  private static getDefaultClinicalGoals(): string {
    return JSON.stringify({
      primary: [
        'Complete 14 consecutive days of sleep tracking',
        'Identify sleep pattern consistency and irregularities',
        'Assess sleep efficiency and quality metrics',
        'Evaluate daytime impact of sleep patterns'
      ],
      clinical: [
        'Screen for sleep disorders (insomnia, sleep apnea)',
        'Assess circadian rhythm patterns',
        'Evaluate sleep hygiene practices',
        'Identify factors affecting sleep quality'
      ],
      outcomes: [
        'Generate clinical sleep assessment report',
        'Provide evidence-based sleep recommendations',
        'Determine need for further sleep medicine evaluation',
        'Establish baseline for treatment monitoring'
      ]
    });
  }
}