import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Try to fetch real entries from database
    let entries = [];
    let error = null;
    
    try {
      if (session?.user?.id) {
        // Fetch entries for logged-in user
        entries = await prisma.sleepEntry.findMany({
          where: { userId: session.user.id },
          orderBy: { date: 'desc' },
          take: 10,
        });
      } else {
        // Fallback: fetch test user entries if not logged in
        const testUser = await prisma.user.findFirst({
          where: { email: "test@example.com" }
        });
        if (testUser) {
          entries = await prisma.sleepEntry.findMany({
            where: { userId: testUser.id },
            orderBy: { date: 'desc' },
            take: 10,
          });
        }
      }
      console.log("[API] Fetched entries from database:", entries.length);
    } catch (dbError) {
      console.error("[API] Database error:", dbError);
      error = String(dbError);
      // Fall back to mock data if database fails
      entries = [
        {
          id: "mock-1",
          userId: "test",
          date: new Date("2024-12-28"),
          bedTime: new Date("2024-12-28T23:30:00"),
          wakeTime: new Date("2024-12-29T07:00:00"),
          sleepQuality: 9,
          notes: "Felt great!",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }

    return NextResponse.json({ 
      entries,
      database_connected: !error,
      error: error,
    });
  } catch (error) {
    console.error("Error fetching sleep entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    console.log("[API] Received sleep entry data:", body);
    
    let savedEntry = null;
    let saveError = null;
    let saveMethod = "mock";
    
    try {
      // Try to save to real database
      const dateTime = new Date(body.date + 'T00:00:00');
      const bedDateTime = new Date(body.date + 'T' + body.bedTime);
      const wakeDateTime = new Date(body.date + 'T' + body.wakeTime);
      
      // If wake time is before bed time, assume next day
      if (wakeDateTime <= bedDateTime) {
        wakeDateTime.setDate(wakeDateTime.getDate() + 1);
      }
      
      let userId: string;
      
      if (session?.user?.id) {
        // Use authenticated user's ID
        userId = session.user.id;
      } else {
        // Fallback: use test user if not logged in
        let user = await prisma.user.findFirst({
          where: { email: "test@example.com" }
        });
        
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: "test@example.com",
              name: "Test User",
            },
          });
        }
        userId = user.id;
      }
      
      savedEntry = await prisma.sleepEntry.create({
        data: {
          userId: userId,
          date: dateTime,
          bedTime: bedDateTime,
          wakeTime: wakeDateTime,
          sleepQuality: body.sleepQuality,
          notes: body.notes || null,
        },
      });
      saveMethod = "database";
      console.log("[API] Saved to database:", savedEntry.id);
    } catch (dbError) {
      console.error("[API] Database save error:", dbError);
      saveError = String(dbError);
      
      // Fall back to mock save
      savedEntry = {
        id: Math.random().toString(),
        ...body,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      saveMethod = "mock";
    }

    return NextResponse.json({ 
      entry: savedEntry,
      debug: {
        save_method: saveMethod,
        database_error: saveError,
        message: saveMethod === "database" ? "Entry saved to database!" : "Entry saved as mock data (database error)"
      }
    });
  } catch (error) {
    console.error("Error creating sleep entry:", error);
    return NextResponse.json(
      { error: "Failed to create entry", details: String(error) },
      { status: 500 }
    );
  }
}
