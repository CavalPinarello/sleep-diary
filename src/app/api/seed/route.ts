import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// This endpoint seeds the database with sample users and data
// For demo purposes only - remove in production
export async function POST() {
  try {
    console.log('Starting database seed...');

    // Check if users already exist
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return NextResponse.json({
        message: 'Database already has users. Seed skipped.',
        existingUsers
      });
    }

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const sarahChen = await prisma.user.create({
      data: {
        email: 'sarah.chen@example.com',
        name: 'Sarah Chen',
        password: hashedPassword,
      },
    });

    const michaelJohnson = await prisma.user.create({
      data: {
        email: 'michael.johnson@example.com',
        name: 'Michael Johnson',
        password: hashedPassword,
      },
    });

    console.log('Created users:', sarahChen.id, michaelJohnson.id);

    // Generate 30 days of sleep data for each user
    const today = new Date();
    const entries = [];

    // Sarah Chen - Good sleeper
    for (let i = 29; i >= 0; i--) {
      const entryDate = new Date(today);
      entryDate.setDate(today.getDate() - i);
      entryDate.setHours(0, 0, 0, 0);

      const timeInBed = new Date(entryDate);
      timeInBed.setHours(22, 30, 0, 0);

      const sleepAttemptTime = new Date(timeInBed);
      sleepAttemptTime.setMinutes(sleepAttemptTime.getMinutes() + 15);

      const finalWakeTime = new Date(entryDate);
      finalWakeTime.setDate(finalWakeTime.getDate() + 1);
      finalWakeTime.setHours(6, 45, 0, 0);

      const outOfBedTime = new Date(finalWakeTime);
      outOfBedTime.setMinutes(outOfBedTime.getMinutes() + 10);

      const totalSleepMins = 30 + Math.floor(Math.random() * 30);
      const timeInBedMinutes = (outOfBedTime.getTime() - timeInBed.getTime()) / (1000 * 60);
      const totalSleepMinutes = 7 * 60 + totalSleepMins;
      const sleepEfficiency = (totalSleepMinutes / timeInBedMinutes) * 100;

      entries.push({
        userId: sarahChen.id,
        date: entryDate,
        timeInBed,
        sleepAttemptTime,
        finalWakeTime,
        outOfBedTime,
        totalSleepHours: 7,
        totalSleepMins,
        sleepLatencyHours: 0,
        sleepLatencyMins: 15 + Math.floor(Math.random() * 10),
        nightAwakenings: Math.floor(Math.random() * 2),
        awakeningDurHours: 0,
        awakeningDurMins: Math.floor(Math.random() * 2) * (5 + Math.floor(Math.random() * 10)),
        earlyAwakening: false,
        earlyAwakeHours: 0,
        earlyAwakeMins: 0,
        sleepQuality: 4 + Math.floor(Math.random() * 2),
        morningRestedness: 3 + Math.floor(Math.random() * 2),
        prevDayNapHours: 0,
        prevDayNapMins: Math.floor(Math.random() * 2) * 20,
        preSleepReading: Math.random() > 0.5,
        preSleepTV: Math.random() > 0.7,
        preSleepOther: null,
        morningAlertness: 7 + Math.floor(Math.random() * 3),
        daytimeEnergy: 7 + Math.floor(Math.random() * 3),
        daytimeFocus: 7 + Math.floor(Math.random() * 3),
        daytimeMood: 7 + Math.floor(Math.random() * 3),
        sleepMedications: null,
        comments: null,
        sleepEfficiency,
        timeInBedDuration: Math.round(timeInBedMinutes),
      });
    }

    // Michael Johnson - Poor sleeper
    for (let i = 29; i >= 0; i--) {
      const entryDate = new Date(today);
      entryDate.setDate(today.getDate() - i);
      entryDate.setHours(0, 0, 0, 0);

      const timeInBed = new Date(entryDate);
      timeInBed.setHours(23, 0, 0, 0);

      const sleepAttemptTime = new Date(timeInBed);
      sleepAttemptTime.setMinutes(sleepAttemptTime.getMinutes() + 30);

      const finalWakeTime = new Date(entryDate);
      finalWakeTime.setDate(finalWakeTime.getDate() + 1);
      finalWakeTime.setHours(6, 30, 0, 0);

      const outOfBedTime = new Date(finalWakeTime);
      outOfBedTime.setMinutes(outOfBedTime.getMinutes() + 30);

      const totalSleepMins = Math.floor(Math.random() * 60);
      const timeInBedMinutes = (outOfBedTime.getTime() - timeInBed.getTime()) / (1000 * 60);
      const totalSleepMinutes = 5 * 60 + totalSleepMins;
      const sleepEfficiency = (totalSleepMinutes / timeInBedMinutes) * 100;

      entries.push({
        userId: michaelJohnson.id,
        date: entryDate,
        timeInBed,
        sleepAttemptTime,
        finalWakeTime,
        outOfBedTime,
        totalSleepHours: 5,
        totalSleepMins,
        sleepLatencyHours: 0,
        sleepLatencyMins: 30 + Math.floor(Math.random() * 30),
        nightAwakenings: 3 + Math.floor(Math.random() * 3),
        awakeningDurHours: 0,
        awakeningDurMins: 30 + Math.floor(Math.random() * 30),
        earlyAwakening: Math.random() > 0.6,
        earlyAwakeHours: Math.random() > 0.6 ? 1 : 0,
        earlyAwakeMins: Math.random() > 0.6 ? 30 : 0,
        sleepQuality: 2 + Math.floor(Math.random() * 2),
        morningRestedness: 1 + Math.floor(Math.random() * 2),
        prevDayNapHours: 0,
        prevDayNapMins: 30 + Math.floor(Math.random() * 30),
        preSleepReading: Math.random() > 0.7,
        preSleepTV: Math.random() > 0.3,
        preSleepOther: Math.random() > 0.7 ? 'Phone browsing' : null,
        morningAlertness: 3 + Math.floor(Math.random() * 3),
        daytimeEnergy: 3 + Math.floor(Math.random() * 3),
        daytimeFocus: 3 + Math.floor(Math.random() * 3),
        daytimeMood: 3 + Math.floor(Math.random() * 3),
        sleepMedications: Math.random() > 0.7 ? 'Melatonin 3mg' : null,
        comments: Math.random() > 0.8 ? 'Had trouble falling asleep' : null,
        sleepEfficiency,
        timeInBedDuration: Math.round(timeInBedMinutes),
      });
    }

    // Create all entries
    await prisma.clinicalSleepEntry.createMany({
      data: entries,
    });

    console.log(`Created ${entries.length} sleep entries`);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      users: [
        { email: 'sarah.chen@example.com', entries: 30 },
        { email: 'michael.johnson@example.com', entries: 30 },
      ],
      credentials: {
        email: 'sarah.chen@example.com or michael.johnson@example.com',
        password: 'password123'
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
