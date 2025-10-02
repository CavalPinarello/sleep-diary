import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { SleepProgramService } from '@/lib/clinical';

// Request validation schema
const createProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required').max(200, 'Program name too long'),
  goals: z.array(z.string()).min(1, 'At least one goal must be selected'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  notifications: z.boolean().default(true),
  notes: z.string().max(500, 'Notes too long').optional()
});

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
    const validatedData = createProgramSchema.parse(body);

    // Check if user already has an active program
    const existingActiveProgram = await SleepProgramService.getActiveProgram(session.user.id);
    if (existingActiveProgram) {
      return NextResponse.json(
        { 
          error: 'Active program exists',
          message: 'You already have an active sleep program. Complete or pause it before starting a new one.',
          existingProgram: existingActiveProgram
        },
        { status: 409 }
      );
    }

    // Create new program
    const program = await SleepProgramService.createProgram(
      session.user.id,
      validatedData.name
    );

    // Update program with user-specified details
    const updatedProgram = await prisma.sleepProgram.update({
      where: { id: program.id },
      data: {
        startDate: new Date(validatedData.startDate),
        endDate: new Date(new Date(validatedData.startDate).getTime() + (13 * 24 * 60 * 60 * 1000)), // 14 days total
        metadata: JSON.stringify({
          protocolVersion: 'Stanford-2024',
          selectedGoals: validatedData.goals,
          notifications: validatedData.notifications,
          userNotes: validatedData.notes || '',
          createdBy: 'user',
          expectedCompletionRate: 0.85
        })
      }
    });

    return NextResponse.json({
      success: true,
      program: updatedProgram,
      message: 'Sleep program created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create program error:', error);

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
      { error: 'Failed to create program', message: 'Internal server error' },
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
    const status = searchParams.get('status'); // Filter by status if provided
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    const whereClause: any = {
      userId: session.user.id
    };

    if (status && ['ACTIVE', 'COMPLETED', 'PAUSED', 'DISCONTINUED'].includes(status)) {
      whereClause.status = status;
    }

    // Fetch programs with entry counts
    const programs = await prisma.sleepProgram.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { entries: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.sleepProgram.count({
      where: whereClause
    });

    return NextResponse.json({
      success: true,
      programs: programs.map(program => ({
        ...program,
        completedEntries: program._count.entries
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Get programs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}