import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Activity, Calendar, Plus } from "lucide-react";
import Link from "next/link";

import { AnalyticsDashboard, AnalyticsSummary } from "@/components/analytics/analytics-dashboard";
import { SleepHistory } from "@/components/dashboard/sleep-history";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sleep Dashboard</h1>
          <p className="text-muted-foreground">Track and analyze your sleep patterns with clinical insights</p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/dashboard/clinical-entry">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Entry
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          
          <TabsTrigger value="history" className="gap-2">
            <Calendar className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Metrics Summary */}
          <AnalyticsSummary className="mb-6" />
          
          {/* Program Enrollment */}
          <Card>
            <CardHeader>
              <CardTitle>Start Your Clinical Sleep Assessment</CardTitle>
              <CardDescription>
                Begin with our 14-day Stanford-based clinical program for comprehensive sleep analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <Link href="/dashboard/programs/enroll">
                  <Button className="w-full h-auto p-4 text-left flex flex-col items-start gap-2">
                    <div className="font-semibold">14-Day Stanford Sleep Program</div>
                    <div className="text-sm text-muted-foreground">
                      Comprehensive clinical assessment with progress tracking
                    </div>
                  </Button>
                </Link>
                
                <Link href="/dashboard/clinical-entry">
                  <Button variant="outline" className="w-full h-auto p-4 text-left flex flex-col items-start gap-2">
                    <div className="font-semibold">Clinical Sleep Diary</div>
                    <div className="text-sm text-muted-foreground">
                      Individual clinical entry with detailed metrics
                    </div>
                  </Button>
                </Link>
              </div>
              
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  💡 <strong>Recommendation:</strong> Start with the 14-day program for the most comprehensive sleep analysis and personalized recommendations
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sleep Entries</CardTitle>
              <CardDescription>Your latest sleep records and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <SleepHistory />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sleep History</CardTitle>
              <CardDescription>Browse and manage your sleep entries</CardDescription>
            </CardHeader>
            <CardContent>
              <SleepHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
