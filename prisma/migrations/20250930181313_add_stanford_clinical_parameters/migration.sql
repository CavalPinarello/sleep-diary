/*
  Warnings:

  - A unique constraint covering the columns `[userId,date]` on the table `SleepEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SleepEntry_date_key";

-- CreateTable
CREATE TABLE "ClinicalSleepEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "timeInBed" DATETIME NOT NULL,
    "preSleepReading" BOOLEAN NOT NULL DEFAULT false,
    "preSleepTV" BOOLEAN NOT NULL DEFAULT false,
    "preSleepOther" TEXT,
    "sleepAttemptTime" DATETIME NOT NULL,
    "sleepLatencyHours" INTEGER NOT NULL DEFAULT 0,
    "sleepLatencyMins" INTEGER NOT NULL DEFAULT 0,
    "nightAwakenings" INTEGER NOT NULL DEFAULT 0,
    "awakeningDurHours" INTEGER NOT NULL DEFAULT 0,
    "awakeningDurMins" INTEGER NOT NULL DEFAULT 0,
    "earlyAwakening" BOOLEAN NOT NULL DEFAULT false,
    "earlyAwakeHours" INTEGER,
    "earlyAwakeMins" INTEGER,
    "finalWakeTime" DATETIME NOT NULL,
    "outOfBedTime" DATETIME NOT NULL,
    "totalSleepHours" INTEGER NOT NULL,
    "totalSleepMins" INTEGER NOT NULL,
    "sleepQuality" INTEGER NOT NULL,
    "morningRestedness" INTEGER NOT NULL,
    "prevDayNapHours" INTEGER NOT NULL DEFAULT 0,
    "prevDayNapMins" INTEGER NOT NULL DEFAULT 0,
    "sleepMedications" TEXT,
    "morningAlertness" INTEGER,
    "daytimeEnergy" INTEGER,
    "daytimeFocus" INTEGER,
    "daytimeMood" INTEGER,
    "sleepEfficiency" REAL,
    "timeInBedDuration" INTEGER,
    "comments" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClinicalSleepEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SleepProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "targetEndDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "daysLogged" INTEGER NOT NULL DEFAULT 0,
    "programType" TEXT NOT NULL DEFAULT 'stanford_14day',
    CONSTRAINT "SleepProgram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ClinicalSleepEntry_userId_date_idx" ON "ClinicalSleepEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "ClinicalSleepEntry_userId_createdAt_idx" ON "ClinicalSleepEntry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ClinicalSleepEntry_userId_sleepEfficiency_idx" ON "ClinicalSleepEntry"("userId", "sleepEfficiency");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicalSleepEntry_userId_date_key" ON "ClinicalSleepEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "SleepProgram_userId_startDate_idx" ON "SleepProgram"("userId", "startDate");

-- CreateIndex
CREATE INDEX "SleepProgram_userId_completed_idx" ON "SleepProgram"("userId", "completed");

-- CreateIndex
CREATE INDEX "SleepProgram_startDate_completed_idx" ON "SleepProgram"("startDate", "completed");

-- CreateIndex
CREATE UNIQUE INDEX "SleepEntry_userId_date_key" ON "SleepEntry"("userId", "date");
