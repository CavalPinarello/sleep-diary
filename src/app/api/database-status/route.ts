import { NextResponse } from "next/server";

export async function GET() {
  const status = {
    database_url_configured: !!process.env.DATABASE_URL,
    database_url_length: process.env.DATABASE_URL?.length || 0,
    database_url_starts_with: process.env.DATABASE_URL?.substring(0, 20) || "not set",
    nextauth_url: process.env.NEXTAUTH_URL || "not set",
    nextauth_secret_configured: !!process.env.NEXTAUTH_SECRET,
    google_client_id_configured: !!process.env.GOOGLE_CLIENT_ID,
    node_env: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    timestamp: new Date().toISOString(),
  };

  // Check if it looks like a valid PostgreSQL URL
  let database_status = "not configured";
  if (process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.startsWith("postgresql://")) {
      database_status = "PostgreSQL URL detected";
    } else if (process.env.DATABASE_URL.startsWith("file:")) {
      database_status = "SQLite file database (won't work on Vercel)";
    } else {
      database_status = "Unknown database format";
    }
  }

  return NextResponse.json({
    ...status,
    database_status,
    message: "Database status check - visit /api/database-status to see this",
    instructions: {
      step1: "If database_url_configured is false, add DATABASE_URL to Vercel env vars",
      step2: "DATABASE_URL should start with 'postgresql://' for Neon",
      step3: "After adding, redeploy from Vercel dashboard",
    },
  });
}