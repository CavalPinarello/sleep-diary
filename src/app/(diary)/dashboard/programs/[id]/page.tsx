"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProgramProgress } from '@/components/program/program-progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';

interface Program {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  targetDays: number;
  completedEntries: number;
  currentStreak: number;
  longestStreak: number;
}

interface Entry {
  id: string;
  date: string;
  sleepEfficiency?: number;
  sleepQuality: number;
  totalSleepHours: number;
  totalSleepMins: number;
}

export default function ProgramDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params.id as string;

  const [program, setProgram] = useState<Program | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (programId) {
      fetchProgramData();
    }
  }, [programId]);

  const fetchProgramData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch program details
      const programResponse = await fetch(`/api/programs/${programId}`);
      if (!programResponse.ok) {
        throw new Error('Failed to fetch program details');
      }
      const programData = await programResponse.json();

      // Fetch program entries
      const entriesResponse = await fetch(`/api/programs/${programId}/entries`);
      if (!entriesResponse.ok) {
        throw new Error('Failed to fetch program entries');
      }
      const entriesData = await entriesResponse.json();

      setProgram(programData);
      setEntries(entriesData);
    } catch (err) {
      console.error('Error fetching program data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load program data');
    } finally {
      setLoading(false);
    }
  };

  const handleNewEntry = () => {
    // Navigate to clinical entry form with program context
    router.push(`/dashboard/clinical-entry?programId=${programId}`);
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-muted-foreground">Loading your program...</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-semibold">Unable to Load Program</h2>
              <p className="text-muted-foreground">
                {error || 'The requested program could not be found.'}
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={handleBackToDashboard}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <Button onClick={fetchProgramData}>
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Navigation Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBackToDashboard}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Program Progress Dashboard */}
      <ProgramProgress
        program={program}
        entries={entries}
        onNewEntry={handleNewEntry}
      />
    </div>
  );
}