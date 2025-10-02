import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { 
  ClinicalValidator, 
  ClinicalCalculations,
  SleepProgramService,
  type ClinicalSleepEntryInput 
} from '@/lib/clinical';
import { 
  clinicalEntrySchema,
  type ClinicalEntryData 
} from '@/lib/schemas/clinical-entry';

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
    const validatedData: ClinicalEntryData = clinicalEntrySchema.parse(body);
    
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');

    // Verify program if specified
    let program = null;
    if (programId) {
      program = await SleepProgramService.getProgramWithEntries(programId);
      if (!program || program.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Invalid or inaccessible program' },
          { status: 403 }
        );
      }
    }

    // Convert form data to clinical validation format
    const clinicalInput: ClinicalSleepEntryInput = {
      date: new Date(validatedData.date),
      timeInBed: new Date(`${validatedData.date}T${validatedData.timeInBed}`),
      sleepAttemptTime: new Date(`${validatedData.date}T${validatedData.sleepAttemptTime}`),
      finalWakeTime: new Date(`${validatedData.date}T${validatedData.finalWakeTime}`),
      outOfBedTime: new Date(`${validatedData.date}T${validatedData.outOfBedTime}`),
      totalSleepHours: validatedData.totalSleepHours,
      totalSleepMins: validatedData.totalSleepMins,
      sleepLatencyHours: validatedData.sleepLatencyHours,
      sleepLatencyMins: validatedData.sleepLatencyMins,
      nightAwakenings: validatedData.nightAwakenings,
      awakeningDurHours: validatedData.awakeningDurHours,
      awakeningDurMins: validatedData.awakeningDurMins,
      prevDayNapHours: validatedData.prevDayNapHours,
      prevDayNapMins: validatedData.prevDayNapMins,
      preSleepReading: validatedData.preSleepReading,
      preSleepTV: validatedData.preSleepTV,
      preSleepOther: validatedData.preSleepOther || '',
      earlyAwakening: validatedData.earlyAwakening,
      earlyAwakeHours: validatedData.earlyAwakeHours,
      earlyAwakeMins: validatedData.earlyAwakeMins,
      sleepQuality: validatedData.sleepQuality,
      morningRestedness: validatedData.morningRestedness,
      morningAlertness: validatedData.morningAlertness,
      daytimeEnergy: validatedData.daytimeEnergy,
      daytimeFocus: validatedData.daytimeFocus,
      daytimeMood: validatedData.daytimeMood,
      sleepMedications: validatedData.sleepMedications || '',
      comments: validatedData.comments || ''
    };

    // Perform clinical validation
    const validationResult = ClinicalValidator.validateSleepEntry(clinicalInput);

    // Check if there's an existing entry for this date
    const existingEntry = await prisma.clinicalSleepEntry.findFirst({
      where: {
        userId: session.user.id,
        date: new Date(validatedData.date),
        sleepProgramId: programId || undefined
      }
    });

    if (existingEntry) {
      return NextResponse.json(
        { 
          error: 'Entry already exists',
          message: 'An entry for this date already exists. Use PUT to update it.',
          existingEntryId: existingEntry.id
        },
        { status: 409 }
      );
    }

    // Calculate clinical metrics
    const timeInBedMinutes = (clinicalInput.outOfBedTime.getTime() - clinicalInput.timeInBed.getTime()) / (1000 * 60);
    const totalSleepMinutes = (validatedData.totalSleepHours * 60) + validatedData.totalSleepMins;
    const sleepEfficiency = ClinicalCalculations.calculateSleepEfficiency(totalSleepMinutes, timeInBedMinutes);

    // Create the clinical sleep entry
    const entry = await prisma.clinicalSleepEntry.create({
      data: {
        userId: session.user.id,
        sleepProgramId: programId || null,
        date: new Date(validatedData.date),
        timeInBed: clinicalInput.timeInBed,
        preSleepReading: validatedData.preSleepReading,
        preSleepTV: validatedData.preSleepTV,
        preSleepOther: validatedData.preSleepOther || null,
        sleepAttemptTime: clinicalInput.sleepAttemptTime,
        sleepLatencyHours: validatedData.sleepLatencyHours,
        sleepLatencyMins: validatedData.sleepLatencyMins,
        nightAwakenings: validatedData.nightAwakenings,
        awakeningDurHours: validatedData.awakeningDurHours,
        awakeningDurMins: validatedData.awakeningDurMins,
        earlyAwakening: validatedData.earlyAwakening,
        earlyAwakeHours: validatedData.earlyAwakeHours || null,
        earlyAwakeMins: validatedData.earlyAwakeMins || null,
        finalWakeTime: clinicalInput.finalWakeTime,
        outOfBedTime: clinicalInput.outOfBedTime,
        totalSleepHours: validatedData.totalSleepHours,
        totalSleepMins: validatedData.totalSleepMins,
        sleepQuality: validatedData.sleepQuality,
        morningRestedness: validatedData.morningRestedness,
        prevDayNapHours: validatedData.prevDayNapHours,
        prevDayNapMins: validatedData.prevDayNapMins,
        sleepMedications: validatedData.sleepMedications || null,
        morningAlertness: validatedData.morningAlertness || null,
        daytimeEnergy: validatedData.daytimeEnergy || null,
        daytimeFocus: validatedData.daytimeFocus || null,
        daytimeMood: validatedData.daytimeMood || null,
        sleepEfficiency: sleepEfficiency,
        timeInBedDuration: Math.round(timeInBedMinutes),
        comments: validatedData.comments || null
      }
    });

    // Update program completion check if associated with a program
    if (program) {
      await SleepProgramService.checkProgramCompletion(program.id);
    }

    // Calculate wellness score if wellness metrics are provided
    const wellnessScore = ClinicalCalculations.calculateWellnessScore({
      morningAlertness: validatedData.morningAlertness,
      daytimeEnergy: validatedData.daytimeEnergy,
      daytimeFocus: validatedData.daytimeFocus,
      daytimeMood: validatedData.daytimeMood
    });

    // Generate clinical flags
    const clinicalFlags = ClinicalCalculations.generateClinicalFlags({
      sleepEfficiency,
      sleepLatencyMinutes: (validatedData.sleepLatencyHours * 60) + validatedData.sleepLatencyMins,
      nightAwakenings: validatedData.nightAwakenings,
      sleepQuality: validatedData.sleepQuality,
      wellnessScore
    });

    return NextResponse.json({
      success: true,
      entry: {
        ...entry,
        calculations: {
          sleepEfficiency,
          totalSleepMinutes,
          sleepLatencyMinutes: (validatedData.sleepLatencyHours * 60) + validatedData.sleepLatencyMins,
          awakeningMinutes: (validatedData.awakeningDurHours * 60) + validatedData.awakeningDurMins,
          timeInBedMinutes,
          wellnessScore,
          clinicalFlags
        }
      },
      validation: validationResult,
      program: program ? {
        id: program.id,
        name: program.name,
        completedEntries: program.entries.length + 1
      } : null,
      message: 'Clinical sleep entry created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create clinical entry error:', error);

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
      { error: 'Failed to create clinical entry', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');
    const includeCalculations = searchParams.get('calculations') === 'true';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    const whereClause: any = {
      userId: session.user.id
    };

    if (programId) {
      whereClause.sleepProgramId = programId;
    }

    if (dateFrom) {
      whereClause.date = {
        ...whereClause.date,
        gte: new Date(dateFrom)
      };
    }

    if (dateTo) {
      whereClause.date = {
        ...whereClause.date,
        lte: new Date(dateTo)
      };
    }

    // Fetch entries
    const entries = await prisma.clinicalSleepEntry.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
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

    // Transform entries and add calculations if requested
    const transformedEntries = entries.map(entry => {
      const baseEntry = {
        id: entry.id,
        date: entry.date,
        sleepQuality: entry.sleepQuality,
        morningRestedness: entry.morningRestedness,
        totalSleepHours: entry.totalSleepHours,
        totalSleepMins: entry.totalSleepMins,
        sleepLatencyHours: entry.sleepLatencyHours,
        sleepLatencyMins: entry.sleepLatencyMins,
        nightAwakenings: entry.nightAwakenings,
        sleepEfficiency: entry.sleepEfficiency,
        morningAlertness: entry.morningAlertness,
        daytimeEnergy: entry.daytimeEnergy,
        daytimeFocus: entry.daytimeFocus,
        daytimeMood: entry.daytimeMood,
        program: entry.sleepProgram,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      };

      if (includeCalculations) {
        const totalSleepMinutes = (entry.totalSleepHours * 60) + entry.totalSleepMins;
        const sleepLatencyMinutes = (entry.sleepLatencyHours * 60) + entry.sleepLatencyMins;
        const awakeningMinutes = (entry.awakeningDurHours * 60) + entry.awakeningDurMins;
        const timeInBedMinutes = entry.timeInBedDuration || 0;

        const wellnessScore = ClinicalCalculations.calculateWellnessScore({
          morningAlertness: entry.morningAlertness || undefined,
          daytimeEnergy: entry.daytimeEnergy || undefined,
          daytimeFocus: entry.daytimeFocus || undefined,
          daytimeMood: entry.daytimeMood || undefined
        });

        const clinicalFlags = ClinicalCalculations.generateClinicalFlags({
          sleepEfficiency: entry.sleepEfficiency || 0,
          sleepLatencyMinutes,
          nightAwakenings: entry.nightAwakenings,
          sleepQuality: entry.sleepQuality,
          wellnessScore
        });

        return {
          ...baseEntry,
          calculations: {
            sleepEfficiency: entry.sleepEfficiency,
            totalSleepMinutes,
            sleepLatencyMinutes,
            awakeningMinutes,
            timeInBedMinutes,
            wellnessScore,
            clinicalFlags
          }
        };
      }

      return baseEntry;
    });

    // Get total count for pagination
    const totalCount = await prisma.clinicalSleepEntry.count({
      where: whereClause
    });

    return NextResponse.json({
      success: true,
      entries: transformedEntries,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Get clinical entries error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinical entries' },
      { status: 500 }
    );
  }
}