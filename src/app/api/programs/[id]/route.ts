import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { SleepProgramService } from '@/lib/clinical';

// Update program schema
const updateProgramSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'DISCONTINUED']).optional(),
  notes: z.string().max(500).optional()
});

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
    
    // Get program with entries and calculate statistics
    const program = await SleepProgramService.getProgramWithEntries(programId);
    
    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (program.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Calculate program statistics
    const statistics = await SleepProgramService.calculateProgramStatistics(programId);
    const recommendations = await SleepProgramService.getProgramRecommendations(programId);

    // Check for auto-completion
    const autoCompleted = await SleepProgramService.checkProgramCompletion(programId);

    return NextResponse.json({
      success: true,
      program: {
        ...program,
        completedEntries: program.entries.length,
        currentStreak: statistics.progress.currentStreak,
        longestStreak: statistics.progress.longestStreak
      },
      statistics,
      recommendations,
      autoCompleted
    });

  } catch (error) {
    console.error('Get program error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const existingProgram = await SleepProgramService.getProgramWithEntries(programId);
    if (!existingProgram) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    if (existingProgram.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateProgramSchema.parse(body);

    // Update program
    if (validatedData.status) {
      await SleepProgramService.updateProgramStatus(
        programId, 
        validatedData.status,
        validatedData.notes
      );
    }

    // Update other fields if provided
    if (validatedData.name) {
      await SleepProgramService.updateProgramStatus(programId, existingProgram.status, validatedData.notes);
    }

    // Fetch updated program
    const updatedProgram = await SleepProgramService.getProgramWithEntries(programId);
    const statistics = await SleepProgramService.calculateProgramStatistics(programId);

    return NextResponse.json({
      success: true,
      program: {
        ...updatedProgram,
        completedEntries: updatedProgram!.entries.length,
        currentStreak: statistics.progress.currentStreak,
        longestStreak: statistics.progress.longestStreak
      },
      statistics,
      message: 'Program updated successfully'
    });

  } catch (error) {
    console.error('Update program error:', error);

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
      { error: 'Failed to update program' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const existingProgram = await SleepProgramService.getProgramWithEntries(programId);
    if (!existingProgram) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    if (existingProgram.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Soft delete by updating status to DISCONTINUED
    await SleepProgramService.updateProgramStatus(
      programId, 
      'DISCONTINUED',
      'Program discontinued by user'
    );

    return NextResponse.json({
      success: true,
      message: 'Program discontinued successfully'
    });

  } catch (error) {
    console.error('Delete program error:', error);
    return NextResponse.json(
      { error: 'Failed to discontinue program' },
      { status: 500 }
    );
  }
}