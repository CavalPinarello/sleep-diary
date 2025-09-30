import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    nextAuthUrl: process.env.NEXTAUTH_URL || "NOT SET",
    githubId: process.env.GITHUB_ID ? "SET (hidden)" : "NOT SET",
    githubSecret: process.env.GITHUB_SECRET ? "SET (hidden)" : "NOT SET",
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "SET (hidden)" : "NOT SET",
    expectedCallbackUrl: `${process.env.NEXTAUTH_URL || "UNKNOWN"}/api/auth/callback/github`,
    nodeEnv: process.env.NODE_ENV,
  });
}
