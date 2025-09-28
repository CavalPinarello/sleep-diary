import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sleep Dashboard</h1>
        <p className="text-muted-foreground">Track and analyze your sleep patterns</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Average Sleep</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">7.5 hrs</div>
            <p className="text-sm text-muted-foreground">+0.5 hrs from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sleep Quality</CardTitle>
            <CardDescription>Average rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8.2/10</div>
            <p className="text-sm text-muted-foreground">Good quality sleep</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entries</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">15</div>
            <p className="text-sm text-muted-foreground">5 more to goal</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
          <CardDescription>Your latest sleep records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">December 28, 2024</p>
                <p className="text-sm text-muted-foreground">
                  11:30 PM - 7:00 AM • Quality: 9/10
                </p>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">December 27, 2024</p>
                <p className="text-sm text-muted-foreground">
                  12:00 AM - 7:30 AM • Quality: 7/10
                </p>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">December 26, 2024</p>
                <p className="text-sm text-muted-foreground">
                  10:45 PM - 6:30 AM • Quality: 8/10
                </p>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/dashboard/new-entry">
              <Button className="w-full">Add New Sleep Entry</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}