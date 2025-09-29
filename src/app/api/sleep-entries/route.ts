import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@/generated/prisma";

// For now, we'll create a mock response since we don't have a real database yet
// This will be updated once you add the Neon database URL

export async function GET(request: NextRequest) {
  try {
    // Mock data for testing
    const mockEntries = [
      {
        id: "1",
        date: new Date("2024-12-28"),
        bedTime: new Date("2024-12-28T23:30:00"),
        wakeTime: new Date("2024-12-29T07:00:00"),
        sleepQuality: 9,
        notes: "Felt great!",
      },
      {
        id: "2",
        date: new Date("2024-12-27"),
        bedTime: new Date("2024-12-27T00:00:00"),
        wakeTime: new Date("2024-12-27T07:30:00"),
        sleepQuality: 7,
        notes: "Okay sleep",
      },
    ];

    return NextResponse.json({ entries: mockEntries });
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
    const body = await request.json();
    
    // For now, just return the data back as if it was saved
    const mockEntry = {
      id: Math.random().toString(),
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({ entry: mockEntry });
  } catch (error) {
    console.error("Error creating sleep entry:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    );
  }
}