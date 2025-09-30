import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    version: "2025-01-30-AUTH-ENABLED",
    commit: "faa14bc",
    timestamp: new Date().toISOString(),
    authEnabled: true,
    message: "If you see this, you're on the latest build with authentication enabled"
  });
}
