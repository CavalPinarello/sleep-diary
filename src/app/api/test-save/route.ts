import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

export async function POST() {
  const prisma = new PrismaClient();
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: "Not authenticated",
        sessionExists: !!session,
        userExists: !!session?.user,
        userIdExists: !!session?.user?.id
      }, { status: 401 });
    }

    // Try to create a test entry
    const testDate = new Date();
    testDate.setHours(0, 0, 0, 0);
    
    const bedTime = new Date();
    bedTime.setHours(23, 0, 0, 0);
    
    const wakeTime = new Date();
    wakeTime.setHours(7, 0, 0, 0);
    wakeTime.setDate(wakeTime.getDate() + 1);

    const entry = await prisma.sleepEntry.create({
      data: {
        userId: session.user.id,
        date: testDate,
        bedTime: bedTime,
        wakeTime: wakeTime,
        sleepQuality: 8,
        notes: "Test entry from API",
      },
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      entry: entry,
      userId: session.user.id,
      message: "Test entry created successfully!"
    });

  } catch (error) {
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: false,
      error: String(error),
      errorName: (error as Error).name,
      errorMessage: (error as Error).message,
    }, { status: 500 });
  }
}
