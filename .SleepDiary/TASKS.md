# Clinical Sleep Diary - Development Tasks
## Phase 0: Clinical Foundation (Weeks 1-3)

*Based on: IMPLEMENTATION_PLAN.md*  
*Sprint Planning for Stanford-Compliant Clinical Development*

---

## 🎯 Phase 0 Overview

Transform the basic Sleep Diary into a Stanford Sleep Health Program compliant clinical assessment platform with comprehensive subjective wellness tracking.

**Goal**: Establish clinical-grade data infrastructure with 14-parameter Stanford compliance and wellness metrics.

---

## Week 1: Database Schema & Clinical Data Model

### Task 1.1: Extend Prisma Schema for Clinical Parameters
**Priority**: Critical | **Effort**: 2 days | **Assignee**: Backend Developer

#### Deliverables:
- [ ] Update `prisma/schema.prisma` with ClinicalSleepEntry model
- [ ] Add SleepProgram model for 14-day tracking
- [ ] Create database migration scripts
- [ ] Generate updated Prisma client
- [ ] Test data migration from existing SleepEntry

#### Acceptance Criteria:
```prisma
model ClinicalSleepEntry {
  id                String   @id @default(cuid())
  userId            String
  date              DateTime
  
  // Stanford Q2-Q3: Pre-sleep phase
  timeInBed         DateTime
  preSleepReading   Boolean  @default(false)
  preSleepTV        Boolean  @default(false)
  sleepAttemptTime  DateTime
  
  // Stanford Q4-Q6: Sleep onset & maintenance
  sleepLatencyHours Int      @default(0)
  sleepLatencyMins  Int      @default(0)
  nightAwakenings   Int      @default(0)
  awakeningDurHours Int      @default(0)
  awakeningDurMins  Int      @default(0)
  
  // Stanford Q7-Q9: Morning awakening
  earlyAwakening    Boolean  @default(false)
  earlyAwakeHours   Int?
  earlyAwakeMins    Int?
  finalWakeTime     DateTime
  outOfBedTime      DateTime
  
  // Stanford Q10: Sleep totals
  totalSleepHours   Int
  totalSleepMins    Int
  
  // Stanford Q11-Q12: Subjective assessments
  sleepQuality      Int      // 1-5 Stanford -> 1-10 display
  morningRestedness Int      // 1-4 Stanford
  
  // Stanford Q13: Previous day factors
  prevDayNapHours   Int      @default(0)
  prevDayNapMins    Int      @default(0)
  
  // Stanford Q1: Medications
  sleepMedications  Json[]   // {name, dose, timeOfTaken, type}
  
  // NEW: Subjective wellness metrics
  morningAlertness  Int?     // 1-10: How alert upon waking?
  daytimeEnergy     Int?     // 1-10: Energy throughout day
  daytimeFocus      Int?     // 1-10: Concentration ability
  daytimeMood       Int?     // 1-10: Overall daily mood
  
  // Clinical computed fields
  sleepEfficiency   Float    // (totalSleep / timeInBed) * 100
  timeInBedDuration Int      // Minutes between inBed and outOfBed
  
  // Stanford Q14: Notes
  comments          String?
  
  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  user              User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, date])
  @@index([userId, date])
  @@index([userId, createdAt])
}
```

#### Testing Requirements:
- [ ] Verify all Stanford parameters captured
- [ ] Test migration preserves existing data
- [ ] Validate indexes for performance
- [ ] Confirm wellness metrics optional fields work

---

### Task 1.2: Create Clinical Calculation Services
**Priority**: Critical | **Effort**: 3 days | **Assignee**: Backend Developer

#### Deliverables:
- [ ] `src/lib/clinical/calculations.ts` - Core clinical metrics
- [ ] `src/lib/clinical/validation.ts` - Clinical threshold checking
- [ ] `src/lib/clinical/wellness.ts` - Wellness scoring algorithms
- [ ] Unit tests with >95% coverage
- [ ] Clinical accuracy validation against known test cases

#### Implementation:
```typescript
// src/lib/clinical/calculations.ts
export class ClinicalCalculations {
  static calculateSleepEfficiency(
    totalSleepMinutes: number,
    timeInBedMinutes: number
  ): number {
    return (totalSleepMinutes / timeInBedMinutes) * 100;
  }

  static calculateWellnessScore(
    alertness?: number,
    energy?: number,
    focus?: number,
    mood?: number
  ): number | undefined {
    const values = [alertness, energy, focus, mood].filter(v => v !== undefined);
    if (values.length === 0) return undefined;
    return values.reduce((sum, val) => sum + val!, 0) / values.length;
  }

  static flagClinicalConcerns(metrics: ClinicalMetrics): ClinicalFlag[] {
    const flags: ClinicalFlag[] = [];
    
    if (metrics.sleepEfficiency < 80) {
      flags.push({
        type: 'SLEEP_EFFICIENCY_LOW',
        severity: 'HIGH',
        message: 'Sleep efficiency below 80% may indicate sleep difficulties'
      });
    }

    if (metrics.sleepLatencyMinutes > 30) {
      flags.push({
        type: 'SLEEP_LATENCY_HIGH',
        severity: 'MEDIUM',
        message: 'Sleep onset taking >30 minutes may indicate insomnia'
      });
    }

    return flags;
  }
}
```

#### Testing Requirements:
- [ ] Test sleep efficiency calculation accuracy
- [ ] Validate clinical threshold flagging
- [ ] Test wellness score averaging
- [ ] Edge case handling (null values, extreme inputs)

---

### Task 1.3: Build Two-Week Program Tracking Model
**Priority**: High | **Effort**: 1 day | **Assignee**: Backend Developer

#### Deliverables:
- [ ] SleepProgram Prisma model
- [ ] Program enrollment service
- [ ] Progress calculation utilities
- [ ] Completion detection logic

#### Implementation:
```prisma
model SleepProgram {
  id            String   @id @default(cuid())
  userId        String
  startDate     DateTime
  targetEndDate DateTime // 14 days from start
  endDate       DateTime? // Actual completion
  completed     Boolean  @default(false)
  daysLogged    Int      @default(0)
  programType   String   @default("stanford_14day")
  
  user          User     @relation(fields: [userId], references: [id])
  
  @@index([userId, startDate])
  @@index([userId, completed])
}
```

#### Acceptance Criteria:
- [ ] Users can enroll in 14-day programs
- [ ] Progress accurately calculated from entries
- [ ] Automatic completion detection at day 14
- [ ] Support for multiple program cycles

---

## Week 2: Multi-Step Clinical Entry Form

### Task 2.1: Design Multi-Step Clinical Entry Form Architecture
**Priority**: Critical | **Effort**: 4 days | **Assignee**: Frontend Developer

#### Deliverables:
- [ ] `src/components/clinical/entry/ClinicalEntryWizard.tsx`
- [ ] Step components for each phase
- [ ] Progressive disclosure logic
- [ ] Mobile-responsive design
- [ ] Accessibility compliance (WCAG 2.1 AA)

#### Component Structure:
```typescript
src/components/clinical/entry/
├── ClinicalEntryWizard.tsx       # Main orchestrator
├── steps/
│   ├── PreSleepStep.tsx          # Evening before (optional)
│   ├── MorningCompletionStep.tsx # Morning after (required)
│   └── DaytimeWellnessStep.tsx   # Evening after (optional)
├── sections/
│   ├── TimeTrackingSection.tsx   # Bed/sleep/wake times
│   ├── SleepQualitySection.tsx   # Quality and restedness
│   ├── AwakeningSection.tsx      # Night interruptions
│   ├── MedicationSection.tsx     # Sleep aids and substances
│   ├── WellnessSection.tsx       # Focus, energy, alertness, mood
│   └── NotesSection.tsx          # Free-form comments
└── validation/
    ├── ClinicalValidation.ts     # Clinical data validation
    └── FormSchemas.ts           # Zod validation schemas
```

#### Acceptance Criteria:
- [ ] All 14 Stanford parameters captured
- [ ] Wellness metrics integrated seamlessly
- [ ] Smart defaults based on user patterns
- [ ] Auto-save and recovery functionality
- [ ] Clear clinical context and tooltips

---

### Task 2.2: Implement Clinical Data Validation System
**Priority**: High | **Effort**: 2 days | **Assignee**: Frontend Developer

#### Deliverables:
- [ ] Zod schemas for all clinical parameters
- [ ] Real-time validation with clinical context
- [ ] Error messaging with educational content
- [ ] Clinical threshold warnings

#### Validation Rules:
```typescript
export const ClinicalValidationRules = {
  sleepLatency: {
    min: 0,
    max: 180, // 3 hours maximum
    warningThreshold: 30, // Flag for potential insomnia
  },
  sleepEfficiency: {
    min: 0,
    max: 100,
    concernThreshold: 85, // Below 85% is concerning
  },
  nightAwakenings: {
    min: 0,
    max: 15,
    warningThreshold: 3, // >3 may indicate sleep maintenance issues
  },
  wellnessMetrics: {
    min: 1,
    max: 10,
    required: false, // Optional but encouraged
  }
};
```

#### Acceptance Criteria:
- [ ] Clinical ranges enforced
- [ ] Helpful error messages with context
- [ ] Warning flags for concerning values
- [ ] Graceful handling of incomplete data

---

### Task 2.3: Create Wellness Parameters Entry Interface
**Priority**: High | **Effort**: 2 days | **Assignee**: Frontend Developer

#### Deliverables:
- [ ] Wellness entry interface with clear labeling
- [ ] Slider components for 1-10 scales
- [ ] Clinical context tooltips
- [ ] Visual feedback for score ranges

#### Wellness Parameters:
- **Morning Alertness** (1-10): "How alert did you feel upon waking?"
- **Daytime Energy** (1-10): "Rate your overall energy throughout the day"
- **Cognitive Focus** (1-10): "How was your concentration and focus ability?"
- **Daily Mood** (1-10): "Rate your overall mood during the day"

#### Acceptance Criteria:
- [ ] Intuitive slider interfaces
- [ ] Clear parameter descriptions
- [ ] Optional entry with encouragement
- [ ] Visual feedback for clinical significance

---

## Week 3: Two-Week Program System

### Task 3.1: Build Program Enrollment & Progress System
**Priority**: High | **Effort**: 3 days | **Assignee**: Full-stack Developer

#### Deliverables:
- [ ] Program enrollment flow with education
- [ ] Progress tracking service
- [ ] Dashboard integration
- [ ] Reminder system

#### Implementation:
```typescript
export class TwoWeekProgram {
  static async enrollUser(userId: string): Promise<SleepProgram> {
    const startDate = new Date();
    const targetEndDate = addDays(startDate, 14);
    
    return await prisma.sleepProgram.create({
      data: {
        userId,
        startDate,
        targetEndDate,
        programType: 'stanford_14day'
      }
    });
  }

  static async getProgress(userId: string): Promise<ProgramProgress> {
    // Calculate completion percentage and days remaining
    // Return progress metrics for dashboard display
  }
}
```

#### Acceptance Criteria:
- [ ] Clear onboarding with clinical context
- [ ] Progress accurately tracked and displayed
- [ ] Automatic completion detection
- [ ] Achievement system for milestones

---

### Task 3.2: Design Progress Visualization Components
**Priority**: Medium | **Effort**: 2 days | **Assignee**: Frontend Developer

#### Deliverables:
- [ ] Progress bar with day indicators
- [ ] Calendar view with completion status
- [ ] Achievement badges
- [ ] Motivational messaging

#### Components:
```typescript
const ProgramProgressCard = () => {
  // Visual progress bar with day indicators
  // Achievement badges for milestones (3, 7, 10, 14 days)
  // Encouraging messages and clinical context
};

const ProgramTimeline = () => {
  // 14-day calendar view with completion status
  // Click to add missing entries
  // Highlight patterns and streaks
};
```

#### Acceptance Criteria:
- [ ] Clear visual progress indicators
- [ ] Motivational but not overwhelming
- [ ] Easy access to missing entries
- [ ] Clinical context for program importance

---

## API Development Tasks

### Task 4.1: Create API Endpoints for Clinical Data
**Priority**: Critical | **Effort**: 2 days | **Assignee**: Backend Developer

#### Endpoints:
```typescript
// Clinical sleep entries
POST   /api/clinical/entries          // Create clinical sleep entry
GET    /api/clinical/entries          // Get user's clinical entries
PUT    /api/clinical/entries/:id      // Update clinical entry
DELETE /api/clinical/entries/:id      // Delete clinical entry

// Two-week program
POST   /api/clinical/program/enroll   // Enroll in 14-day program
GET    /api/clinical/program/progress // Get program progress
POST   /api/clinical/program/complete // Mark program complete
```

#### Acceptance Criteria:
- [ ] Proper authentication and authorization
- [ ] Input validation with clinical rules
- [ ] Error handling with meaningful messages
- [ ] API documentation and testing

---

### Task 4.2: Build Clinical Metrics Calculation API
**Priority**: High | **Effort**: 2 days | **Assignee**: Backend Developer

#### Endpoints:
```typescript
GET /api/clinical/metrics          // Get clinical metrics
GET /api/clinical/wellness         // Get wellness analytics
GET /api/clinical/patterns         // Get pattern analysis
```

#### Acceptance Criteria:
- [ ] Real-time clinical calculations
- [ ] Caching for performance
- [ ] Statistical accuracy
- [ ] Proper error handling

---

## Testing & Quality Assurance

### Clinical Accuracy Testing
- [ ] Validate calculations against Stanford standards
- [ ] Test clinical threshold flagging
- [ ] Verify wellness correlation algorithms
- [ ] Edge case handling

### Integration Testing
- [ ] End-to-end clinical entry workflow
- [ ] Program enrollment and progress tracking
- [ ] API endpoint functionality
- [ ] Database migration testing

### Performance Testing
- [ ] Clinical calculation performance
- [ ] Database query optimization
- [ ] Large dataset handling
- [ ] Mobile responsiveness

---

## Definition of Done

### For Each Task:
- [ ] Code reviewed and approved
- [ ] Unit tests passing (>90% coverage)
- [ ] Integration tests passing
- [ ] Clinical accuracy validated
- [ ] Documentation updated
- [ ] Accessibility compliance verified
- [ ] Mobile responsiveness confirmed
- [ ] Performance benchmarks met

### For Phase 0 Completion:
- [ ] All Stanford parameters captured
- [ ] Wellness metrics fully integrated
- [ ] 14-day program system operational
- [ ] Clinical calculations accurate
- [ ] API endpoints functional
- [ ] User testing completed
- [ ] Clinical review approved

---

**Next Phase**: Enhanced Clinical Dashboard with real-time statistics and insights (Weeks 4-5)