import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { SleepProgramService, ClinicalCalculations } from '@/lib/clinical';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const programId = params.id;
    
    // Verify program exists and user has access
    const program = await SleepProgramService.getProgramWithEntries(programId);
    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    if (program.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get URL parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const includeCalculations = searchParams.get('calculations') === 'true';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    const whereClause: any = {
      sleepProgramId: programId,
      userId: session.user.id
    };

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
      orderBy: { date: 'asc' },
      take: limit,
      skip: offset
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
        awakeningDurHours: entry.awakeningDurHours,
        awakeningDurMins: entry.awakeningDurMins,
        earlyAwakening: entry.earlyAwakening,
        morningAlertness: entry.morningAlertness,
        daytimeEnergy: entry.daytimeEnergy,
        daytimeFocus: entry.daytimeFocus,
        daytimeMood: entry.daytimeMood,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      };

      if (includeCalculations) {
        // Calculate sleep metrics
        const timeInBedMinutes = (entry.outOfBedTime.getTime() - entry.timeInBed.getTime()) / (1000 * 60);
        const totalSleepMinutes = (entry.totalSleepHours * 60) + entry.totalSleepMins;
        const sleepLatencyMinutes = (entry.sleepLatencyHours * 60) + entry.sleepLatencyMins;
        const awakeningMinutes = (entry.awakeningDurHours * 60) + entry.awakeningDurMins;

        const sleepEfficiency = ClinicalCalculations.calculateSleepEfficiency(
          totalSleepMinutes,
          timeInBedMinutes
        );

        const wellnessScore = ClinicalCalculations.calculateWellnessScore({
          morningAlertness: entry.morningAlertness || undefined,
          daytimeEnergy: entry.daytimeEnergy || undefined,
          daytimeFocus: entry.daytimeFocus || undefined,
          daytimeMood: entry.daytimeMood || undefined
        });

        const clinicalFlags = ClinicalCalculations.generateClinicalFlags({
          sleepEfficiency,
          sleepLatencyMinutes,
          nightAwakenings: entry.nightAwakenings,
          sleepQuality: entry.sleepQuality,
          wellnessScore
        });

        return {
          ...baseEntry,
          calculations: {
            sleepEfficiency,
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
      program: {
        id: program.id,
        name: program.name,
        startDate: program.startDate,
        endDate: program.endDate,
        status: program.status,
        targetDays: program.targetDays
      },
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Get program entries error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program entries' },
      { status: 500 }
    );
  }
}