"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewEntryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      date: formData.get("date"),
      bedTime: formData.get("bedTime"),
      wakeTime: formData.get("wakeTime"),
      sleepQuality: parseInt(formData.get("sleepQuality") as string),
      notes: formData.get("notes"),
    };

    try {
      const response = await fetch("/api/sleep-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        alert("Failed to save entry. Please try again.");
      }
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Failed to save entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>New Sleep Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                id="date"
                name="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedTime">Bedtime</Label>
                <Input
                  type="time"
                  id="bedTime"
                  name="bedTime"
                  required
                  defaultValue="23:00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wakeTime">Wake Time</Label>
                <Input
                  type="time"
                  id="wakeTime"
                  name="wakeTime"
                  required
                  defaultValue="07:00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sleepQuality">Sleep Quality (1-10)</Label>
              <Input
                type="range"
                id="sleepQuality"
                name="sleepQuality"
                min="1"
                max="10"
                defaultValue="7"
                className="w-full"
              />
              <div className="text-center text-sm text-muted-foreground">
                <span id="qualityValue">7</span>/10
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea
                id="notes"
                name="notes"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="How did you sleep? Any dreams or disruptions?"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Entry"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/dashboard")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Add this script to update the quality value display
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("sleepQuality") as HTMLInputElement;
    const valueDisplay = document.getElementById("qualityValue");
    
    if (slider && valueDisplay) {
      slider.addEventListener("input", () => {
        valueDisplay.textContent = slider.value;
      });
    }
  });
}