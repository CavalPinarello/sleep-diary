"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-xl font-bold">
                Sleep Diary
              </Link>
              <nav className="flex gap-4">
                <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
                  Dashboard
                </Link>
                <Link href="/dashboard/new-entry" className="text-sm font-medium hover:text-primary">
                  New Entry
                </Link>
                <Link href="/dashboard/analytics" className="text-sm font-medium hover:text-primary">
                  Analytics
                </Link>
                <Link href="/dashboard/fountain-pen" className="text-sm font-medium hover:text-primary">
                  Fountain Pen
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {session?.user && (
                <span className="text-sm text-muted-foreground">
                  {session.user.email}
                </span>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}