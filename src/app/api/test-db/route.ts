import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

export async function GET() {
  const prisma = new PrismaClient();
  
  try {
    // Try to connect and count users
    const userCount = await prisma.user.count();
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      databaseUrl: process.env.DATABASE_URL ? "SET (hidden)" : "NOT SET",
      connectionTest: "SUCCESS",
      userCount: userCount,
      message: "Database is connected!"
    });
  } catch (error) {
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: false,
      databaseUrl: process.env.DATABASE_URL ? "SET (hidden)" : "NOT SET",
      connectionTest: "FAILED",
      error: String(error),
      message: "Database connection failed"
    }, { status: 500 });
  }
}
