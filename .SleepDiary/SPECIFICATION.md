# Sleep Diary Enhancement Specification
## Clinical-Grade Analytics & Two-Week Tracking Program

*Version: 2.0*  
*Created: September 30, 2025*  
*Updated: September 30, 2025*  
*Specification Type: Feature Enhancement*  
*Clinical Standard: Based on Stanford Sleep Health and Insomnia Program*

---

## Executive Summary

This specification outlines the development of a comprehensive, clinical-grade Sleep Diary application following Stanford Sleep Health and Insomnia Program guidelines. The enhancement transforms the current basic tracking app into a medically-relevant tool that captures detailed subjective sleep parameters over a recommended two-week period, providing meaningful insights, trends, and actionable recommendations for sleep optimization.

**Key Clinical Integration**: This specification incorporates the Stanford Sleep Health and Insomnia Program diary structure, ensuring medical-grade data collection suitable for healthcare provider consultations and sleep disorder assessment.

## Problem Statement

### Current State Analysis
The existing Sleep Diary application has:
- ✅ Basic sleep entry creation (date, bed time, wake time, quality 1-10, notes)
- ✅ Simple dashboard with recent entries display
- ✅ Hardcoded statistics (not connected to real data)
- ✅ Google OAuth authentication
- ✅ Responsive UI with shadcn/ui components

### Clinical Requirements Gap Analysis
Compared to Stanford Sleep Health and Insomnia Program standards, our current application lacks:

#### **Critical Clinical Parameters Missing**
- ❌ **Sleep onset latency tracking**: How long it takes to fall asleep
- ❌ **Night awakening details**: Number and duration of awakenings
- ❌ **Early morning awakening**: Tracking unplanned early wake-ups
- ❌ **Sleep efficiency metrics**: Time in bed vs actual sleep time
- ❌ **Medication/substance tracking**: Sleep aids, alcohol, prescriptions
- ❌ **Daytime napping**: Duration and timing of naps
- ❌ **Subjective wellness parameters**: Morning alertness, daytime energy, focus
- ❌ **Pre-sleep activities**: Reading, TV, screen time tracking
- ❌ **Two-week program structure**: Recommended clinical tracking period

#### **Analytics & Visualization Gaps**
- ❌ **No data visualization**: Users cannot see trends or patterns in their sleep data
- ❌ **Static dashboard**: Statistics cards show hardcoded values instead of calculated metrics
- ❌ **Limited insights**: No analysis of sleep patterns, quality trends, or correlations
- ❌ **No clinical reports**: Missing medical-grade export for healthcare providers
- ❌ **No sleep debt calculation**: Cumulative sleep deficit tracking
- ❌ **Basic navigation**: No dedicated analytics section

### User Impact
Without comprehensive analytics, users cannot:
1. Understand their sleep patterns and trends over time
2. Identify factors affecting their sleep quality
3. Make data-driven decisions to improve their sleep habits
4. Track progress toward sleep goals
5. Spot concerning patterns that may indicate health issues

## Business Objectives

### Primary Goals
1. **Transform Static Dashboard**: Replace hardcoded statistics with real-time calculations from user data
2. **Enable Pattern Recognition**: Help users identify trends in their sleep quality and duration
3. **Provide Actionable Insights**: Generate personalized recommendations based on sleep data analysis
4. **Improve User Engagement**: Create compelling visualizations that encourage daily usage
5. **Support Long-term Tracking**: Build analytics that become more valuable over time

### Success Metrics
- **Engagement**: Increase daily active users by 40%
- **Retention**: Improve 30-day retention rate by 25%
- **Data Quality**: Increase average entries per user by 30%
- **User Satisfaction**: Achieve 4.5+ rating for analytics features
- **Performance**: Analytics load time < 2 seconds

## Target Users & Use Cases

### Primary User: Health-Conscious Individual
**Profile**: 
- Age: 25-45, values wellness and self-improvement
- Uses sleep tracking for personal optimization
- Comfortable with technology and data

**Use Cases**:
1. **Daily Check-in**: View yesterday's sleep performance vs. personal averages
2. **Weekly Review**: Analyze trends to understand what affects sleep quality
3. **Monthly Progress**: Track improvements and identify patterns
4. **Goal Setting**: Set and monitor progress toward sleep targets

### Secondary User: Individual with Sleep Concerns
**Profile**:
- May have irregular sleep patterns or quality issues
- Looking for patterns that correlate with sleep problems
- May share data with healthcare providers

**Use Cases**:
1. **Pattern Analysis**: Identify triggers for poor sleep quality
2. **Data Export**: Generate reports for medical consultations
3. **Trend Monitoring**: Track whether interventions improve sleep
4. **Correlation Discovery**: Find relationships between lifestyle and sleep

## Enhanced Data Model: Clinical Sleep Parameters

### Stanford-Compliant Sleep Entry Structure

Based on the Stanford Sleep Health and Insomnia Program diary, our enhanced data model will capture:

#### **Core Sleep Architecture**
```typescript
interface ClinicalSleepEntry {
  // Basic identifiers
  id: string;
  userId: string;
  date: Date; // Entry date (completed morning after sleep)
  
  // Pre-sleep phase
  timeInBed: Date;           // Q2: What time did you get into bed?
  preSleepActivity: {        // Q3: Read or TV before trying to sleep?
    reading: boolean;
    tv: boolean;
    other?: string;
  };
  sleepAttemptTime: Date;    // Q3: What time did you try to go to sleep?
  
  // Sleep onset
  sleepLatency: {            // Q4: How long did it take you to fall asleep?
    hours: number;
    minutes: number;
  };
  
  // Night interruptions
  nightAwakenings: number;   // Q5: How many times did you wake up?
  awakeningDuration: {       // Q6: Total time of awakenings
    hours: number;
    minutes: number;
  };
  
  // Morning awakening
  earlyAwakening: {          // Q7: Did you wake up earlier than planned?
    occurred: boolean;
    duration?: {
      hours: number;
      minutes: number;
    };
  };
  finalWakeTime: Date;       // Q8: Time of final awakening
  outOfBedTime: Date;        // Q9: Time you got out of bed
  
  // Sleep totals
  totalSleepTime: {          // Q10: Total sleep duration
    hours: number;
    minutes: number;
  };
  
  // Subjective assessments
  sleepQuality: number;      // Q11: Quality rating (1-5, converted to 1-10)
  morningRestedness: number; // Q12: How rested/refreshed (1-4)
  
  // Daytime factors
  previousDayNap: {          // Q13: Nap duration yesterday
    hours: number;
    minutes: number;
  };
  
  // Medications & substances
  sleepAids: Array<{         // Q1: Medications/alcohol
    name: string;
    dose: string;
    timeOfTaken: Date;
    type: 'prescription' | 'otc' | 'alcohol' | 'supplement';
  }>;
  
  // Additional subjective wellness (NEW)
  wellnessMetrics: {
    morningAlertness: number;  // 1-10: How alert did you feel upon waking?
    daytimeEnergy: number;     // 1-10: Overall energy level during the day
    daytimeFocus: number;      // 1-10: Concentration/focus ability
    daytimeMood: number;       // 1-10: Overall mood during the day
  };
  
  // Free-form notes
  comments: string;          // Q14: Comments
  
  // Computed fields (calculated)
  sleepEfficiency: number;   // (total sleep time / time in bed) * 100
  timeInBedDuration: number; // Minutes between in bed and out of bed
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Two-Week Tracking Program**

**Clinical Recommendation**: Stanford recommends 14 consecutive days of tracking for meaningful pattern recognition.

**Implementation Features**:
- **Program Enrollment**: Users can start a "2-Week Sleep Assessment"
- **Progress Tracking**: Visual progress indicator (Day 3 of 14)
- **Completion Rewards**: Achievement system for completing full 14-day cycle
- **Reminder System**: Daily notifications for consistent tracking
- **Clinical Export**: Generate comprehensive 14-day report for medical consultation

#### **Data Validation & Clinical Accuracy**

**Validation Rules**:
- Sleep latency: 0-180 minutes (flag >60 minutes as potential concern)
- Total sleep time: 2-16 hours (flag outliers)
- Sleep efficiency: 0-100% (flag <85% as potential concern)
- Night awakenings: 0-15 times (flag >3 as potential concern)
- Consistency checks: bedtime within reasonable range of previous entries

**Data Quality Indicators**:
- Completion percentage for 14-day program
- Missing data warnings
- Inconsistency flags (e.g., sleep time > time in bed)

## Functional Requirements

### 0. Enhanced Sleep Entry Form (Clinical Grade)

#### 0.1 Multi-Step Entry Process
**Requirement**: Replace simple form with comprehensive Stanford-compliant entry system

**Flow Design**:
1. **Pre-Sleep Phase** (Evening before, optional)
   - Time got into bed
   - Pre-sleep activities (reading, TV)
   - Sleep medications taken
   - Time attempted to sleep

2. **Morning Completion** (Required)
   - Sleep onset time estimation
   - Night awakening details
   - Final wake time and out-of-bed time
   - Subjective quality and restedness
   - Previous day napping

3. **Daytime Wellness** (Evening after, optional)
   - Energy levels during the day
   - Focus and concentration
   - Mood assessment
   - Overall functioning

#### 0.2 Smart Form Features
**Auto-calculations**:
- Sleep efficiency percentage
- Total time in bed
- Sleep debt accumulation
- Pattern deviation alerts

**User Experience**:
- Progressive disclosure (show relevant fields based on answers)
- Smart defaults based on user patterns
- Quick entry mode for experienced users
- Detailed mode for clinical accuracy

**Validation & Guidance**:
- Real-time validation with clinical context
- Helpful tooltips explaining medical relevance
- Gentle reminders for missed entries
- Data quality scores

### 1. Enhanced Dashboard (Real-time Clinical Statistics)

#### 1.1 Clinical Statistics Cards
**Requirement**: Replace hardcoded values with calculated clinical metrics from Stanford-compliant sleep data

**Primary Cards**:
- **Sleep Efficiency**: 
  - Last 7 days average (total sleep time / time in bed)
  - Display format: "89%" with trend indicator (+3% from last week)
  - Color coding: Green (>85%), Yellow (80-85%), Red (<80%)
  - Clinical context tooltip explaining significance

- **Sleep Onset Latency**:
  - Average time to fall asleep (last 7 days)
  - Display format: "12 min" with comparison to previous week
  - Color coding: Green (<20 min), Yellow (20-30 min), Red (>30 min)
  - Flag for potential insomnia concerns

- **Night Awakening Index**:
  - Average awakenings per night (last 7 days)
  - Total awakening time per night
  - Display format: "1.2 times, 8 min total"
  - Color coding based on sleep maintenance quality

**Secondary Cards**:
- **Subjective Wellness Score**:
  - Combined metric: (morning alertness + daytime energy + focus + mood) / 4
  - Display format: "7.8/10" with wellness category
  - Trend comparison to sleep quality correlation

- **Two-Week Program Progress**:
  - Current tracking streak and completion percentage
  - Display format: "Day 9 of 14" with progress bar
  - Achievement badges for milestones

- **Sleep Debt Accumulation**:
  - Running total vs. 8-hour target over past week
  - Display format: "-2.5 hrs" (debt) or "+1.2 hrs" (surplus)
  - Visual debt/credit indicator

#### 1.2 Clinical Insights Panel
**New component**: Intelligent insights based on Stanford sleep parameters

**Clinical Insights**:
- **Sleep Pattern Alerts**:
  - "Your sleep latency has increased 40% this week" (flag potential concerns)
  - "Sleep efficiency below clinical threshold (85%) for 3 consecutive days"
  - "Night awakenings trending upward - consider environmental factors"

- **Subjective Wellness Correlations**:
  - "Your focus scores improve by 23% after 8+ hours of sleep"
  - "Morning alertness strongly correlates with sleep efficiency (r=0.78)"
  - "Best energy days follow nights with <2 awakenings"

- **Two-Week Program Insights**:
  - **Progress Highlights**: "You've completed 60% of your 14-day assessment"
  - **Pattern Emergence**: "Weekend bedtime shifts detected - impacts Monday energy"
  - **Clinical Readiness**: "Sufficient data for medical consultation available"

**Personalized Recommendations**:
- **Timing Optimization**: "Your optimal sleep window: 10:45 PM - 6:45 AM"
- **Efficiency Improvement**: "Reducing time in bed by 30 minutes may improve efficiency"
- **Wellness Enhancement**: "Focus peaks when sleep latency < 15 minutes"

**Acceptance Criteria**:
- Insights generate only with sufficient data (minimum 5 days)
- Clinical thresholds based on sleep medicine standards
- Clear distinction between observations and medical recommendations
- Handle edge cases and provide educational fallbacks

### 2. Two-Week Clinical Program Dashboard

#### 2.0 Program Overview & Enrollment
**Implementation**: Dedicated section for Stanford-recommended 14-day tracking

**Features**:
- **Program Introduction**: Educational content about clinical sleep assessment
- **Enrollment Flow**: Guided setup with expectations and commitment
- **Progress Tracking**: Visual timeline showing completion status
- **Daily Reminders**: Smart notifications for optimal entry timing
- **Completion Celebration**: Achievement system and clinical report generation

**Route**: `/dashboard/program` 

#### 2.1 Subjective Wellness Tracking
**New Feature**: Focus, Energy, Alertness, and Mood Analytics

##### Daily Wellness Entry
**Integration**: Part of enhanced sleep entry form

**Parameters**:
- **Morning Alertness** (1-10): "How alert did you feel upon waking?"
- **Daytime Energy** (1-10): "Rate your overall energy throughout the day"
- **Cognitive Focus** (1-10): "How was your concentration and focus ability?"
- **Daily Mood** (1-10): "Rate your overall mood during the day"

##### Wellness Analytics Dashboard
**Route**: `/dashboard/analytics/wellness`

**Chart 1: Wellness Trend Lines**
- Four parallel trend lines (alertness, energy, focus, mood)
- 14-day view with daily data points
- Correlation indicators with sleep metrics
- Weekend vs weekday pattern analysis

**Chart 2: Sleep-Wellness Correlation Matrix**
- Scatter plots showing relationships:
  - Sleep duration vs daytime energy
  - Sleep efficiency vs morning alertness
  - Sleep latency vs cognitive focus
  - Night awakenings vs mood stability
- Statistical correlation coefficients
- Clinical significance indicators

**Chart 3: Wellness Heatmap Calendar**
- 14-day calendar view with color-coded wellness scores
- Toggle between different wellness parameters
- Click to view detailed daily breakdown
- Pattern recognition for weekly cycles

#### 2.2 Clinical Sleep Parameters Analytics
**Enhancement**: Stanford-compliant clinical dashboard

##### Sleep Efficiency Analysis
**Chart**: Sleep efficiency trend with clinical benchmarks
- Daily efficiency percentages over 14-day period
- Clinical threshold lines (85% normal, 80% concerning)
- Time in bed vs actual sleep time comparison
- Recommendations for sleep restriction therapy if appropriate

##### Sleep Latency & Maintenance
**Chart**: Sleep onset and maintenance metrics
- Sleep latency trend (time to fall asleep)
- Night awakening frequency and duration
- Early morning awakening patterns
- Clinical insomnia screening indicators

### 3. Dedicated Analytics Dashboard

#### 2.1 Navigation Enhancement
**Implementation**: Add "Analytics" tab to main navigation

**Route**: `/dashboard/analytics`

**Access**: Protected route requiring authentication

#### 2.2 Time Period Controls
**Component**: Date range selector

**Options**:
- Last 7 days
- Last 30 days  
- Last 3 months
- Last 6 months
- Custom date range picker

**Default**: Last 30 days

#### 2.3 Sleep Duration Analysis

##### Chart 1: Sleep Duration Trend (Line Chart)
**Data**: Daily sleep duration over selected period

**Features**:
- X-axis: Date
- Y-axis: Hours of sleep
- Target line at user's goal (default 8 hours)
- Hover tooltips showing exact duration and date
- Color coding: Green (target ±30min), Yellow (±1hr), Red (>1hr variance)

**Insights Panel**:
- Average duration for period
- Longest/shortest sleep days
- Consistency score (standard deviation)
- Trend direction (improving/declining/stable)

##### Chart 2: Sleep Duration Distribution (Histogram)
**Data**: Frequency distribution of sleep durations

**Features**:
- X-axis: Duration buckets (5-6hrs, 6-7hrs, 7-8hrs, etc.)
- Y-axis: Number of nights
- Highlight optimal range (7-9 hours)
- Show percentage of nights in each bucket

#### 2.4 Sleep Quality Analysis

##### Chart 3: Quality Score Trend (Line Chart)
**Data**: Daily sleep quality ratings over selected period

**Features**:
- X-axis: Date
- Y-axis: Quality score (1-10)
- Moving average trend line
- Color coding based on quality levels
- Annotations for notes on significant days

**Quality Insights**:
- Average quality for period
- Best/worst quality days
- Quality distribution breakdown
- Correlation with sleep duration

##### Chart 4: Quality vs Duration Scatter Plot
**Data**: Each point represents one night (X: duration, Y: quality)

**Features**:
- Identify sweet spot for optimal quality
- Trend line showing correlation
- Outlier highlighting
- Filter by date range

#### 2.5 Sleep Pattern Analysis

##### Chart 5: Bedtime & Wake Time Patterns (Timeline Chart)
**Data**: Daily bedtimes and wake times

**Features**:
- X-axis: Date
- Y-axis: Time of day (24-hour format)
- Two lines: bedtime and wake time
- Highlight weekday vs weekend patterns
- Consistency indicators

**Pattern Insights**:
- Average bedtime and wake time
- Variability (sleep schedule consistency)
- Weekend vs weekday differences
- Social jet lag indicator

##### Chart 6: Sleep Schedule Heatmap (Calendar View)
**Data**: Color-coded calendar showing sleep metrics

**Features**:
- Calendar grid with months/days
- Color intensity based on:
  - Sleep duration (option 1)
  - Sleep quality (option 2)
  - Bedtime regularity (option 3)
- Toggle between different metrics
- Click to view specific day details

### 3. Advanced Analytics Features

#### 3.1 Sleep Insights Engine

##### Weekly Sleep Report
**Trigger**: Generated every Monday for previous week

**Content**:
- **Summary Statistics**: Average duration, quality, consistency
- **Achievements**: "Best sleep week in 2 months", "7-day streak achieved"
- **Patterns Identified**: "You sleep 30 minutes longer on weekends"
- **Recommendations**: Personalized suggestions based on data

##### Monthly Sleep Analysis
**Trigger**: Generated first of each month

**Content**:
- **Month-over-month comparison**
- **Goal progress tracking**
- **Trend analysis**: Improving/declining areas
- **Seasonal patterns**: If enough historical data

#### 3.2 Correlation Analysis

##### Factor Impact Analysis
**Implementation**: Analyze relationships between:
- Day of week vs sleep quality
- Sleep duration vs quality correlation
- Bedtime consistency vs quality
- Wake time consistency vs quality

**Display**: 
- Correlation strength indicators
- Insights like "You sleep 20% better when going to bed before 11 PM"
- Statistical significance indicators

#### 3.3 Personalized Recommendations

##### Recommendation Engine
**Logic**: Based on user's data patterns

**Categories**:

1. **Timing Recommendations**:
   - "Try going to bed 15 minutes earlier for better quality"
   - "Your optimal bedtime appears to be 10:30 PM"

2. **Consistency Suggestions**:
   - "Keeping a regular schedule could improve your sleep by 15%"
   - "Weekend sleep-ins may be affecting your weekday quality"

3. **Duration Optimization**:
   - "You seem to function best with 7.5 hours of sleep"
   - "Consider aiming for 8 hours to improve quality scores"

4. **Quality Improvement**:
   - "Your best sleep happens when bedtime is before 11 PM"
   - "Quality drops when sleep duration exceeds 9 hours"

**Implementation**: 
- Display as cards in analytics dashboard
- Refresh weekly based on new data
- Allow dismissing recommendations

### 4. Clinical Data Export & Medical Reporting

#### 4.1 Stanford-Compliant Export Functionality

##### Clinical CSV Export
**Features**:
- Complete Stanford Sleep Diary parameters
- 14-day program data with all subjective wellness metrics
- Calculated clinical indices (sleep efficiency, latency, etc.)
- Medication and substance tracking
- Medical consultation ready format

**Enhanced Format**:
```csv
Date,TimeInBed,SleepAttempt,SleepLatencyMin,Awakenings,AwakeningDurationMin,FinalWake,OutOfBed,TotalSleepHours,SleepEfficiency,Quality,Restedness,MorningAlertness,DaytimeEnergy,CognitiveFocus,DailyMood,NapDuration,Medications,PreSleepActivity,Comments
2025-09-29,23:00,23:15,12,2,8,06:45,07:00,7.5,89.3,8,7,8,7,8,7,0,"","Reading","Good sleep"
```

##### Clinical PDF Report (Stanford Format)
**Features**:
- Professional medical consultation format
- Stanford Sleep Health Program branding/compatibility
- 14-day comprehensive analysis
- Clinical threshold analysis and flags
- Subjective wellness correlation analysis
- Healthcare provider summary

**Report Sections**:
1. **Patient Summary**
   - Tracking period and completion rate
   - Clinical concern flags
   - Overall sleep health score

2. **Sleep Architecture Analysis**
   - Sleep efficiency trends and clinical benchmarks
   - Sleep latency patterns and insomnia indicators
   - Night awakening analysis and sleep maintenance
   - Early morning awakening patterns

3. **Subjective Wellness Assessment**
   - Morning alertness patterns
   - Daytime energy and functioning
   - Cognitive focus and concentration
   - Mood stability and sleep correlation

4. **Clinical Data Tables**
   - Raw 14-day Stanford diary format
   - Statistical summaries and averages
   - Medication/substance usage log

5. **Healthcare Provider Recommendations**
   - Pattern-based clinical observations
   - Suggested areas for medical evaluation
   - Sleep hygiene opportunities
   - Follow-up tracking recommendations

##### Two-Week Program Completion Report
**Trigger**: Automatic generation upon 14-day completion

**Features**:
- Comprehensive clinical summary
- Achievement celebration with clinical context
- Recommendations for continued tracking
- Medical consultation preparation checklist

#### 4.2 Sharing Features

##### Shareable Insights
**Implementation**: Generate secure links to specific insights

**Use Cases**:
- Share progress with accountability partners
- Provide data to healthcare providers
- Social sharing of achievements

**Privacy**: 
- Anonymize personal details
- Temporary links with expiration
- Opt-in sharing only

## Technical Requirements

### 1. Architecture Considerations

#### 1.1 Data Layer Enhancements

##### Database Schema Enhancement
**Current Schema**: Basic SleepEntry model needs expansion for clinical parameters

**Required Schema Updates**: Extend existing Prisma schema
```prisma
model ClinicalSleepEntry {
  id                String   @id @default(cuid())
  userId            String
  date              DateTime
  
  // Pre-sleep phase
  timeInBed         DateTime
  preSleepReading   Boolean  @default(false)
  preSleepTV        Boolean  @default(false) 
  preSleepOther     String?
  sleepAttemptTime  DateTime
  
  // Sleep onset & maintenance
  sleepLatencyHours Int      @default(0)
  sleepLatencyMins  Int      @default(0)
  nightAwakenings   Int      @default(0)
  awakeningDurHours Int      @default(0)
  awakeningDurMins  Int      @default(0)
  
  // Morning awakening
  earlyAwakening    Boolean  @default(false)
  earlyAwakeHours   Int?
  earlyAwakeMins    Int?
  finalWakeTime     DateTime
  outOfBedTime      DateTime
  
  // Sleep totals
  totalSleepHours   Int
  totalSleepMins    Int
  
  // Subjective assessments (Stanford scale)
  sleepQuality      Int      // 1-5 (Stanford) -> converted to 1-10
  morningRestedness Int      // 1-4 (Stanford)
  
  // Previous day factors
  prevDayNapHours   Int      @default(0)
  prevDayNapMins    Int      @default(0)
  
  // Subjective wellness metrics (NEW)
  morningAlertness  Int?     // 1-10
  daytimeEnergy     Int?     // 1-10
  daytimeFocus      Int?     // 1-10
  daytimeMood       Int?     // 1-10
  
  // Sleep aids & medications
  sleepMedications  Json[]   // Array of {name, dose, timeOfTaken, type}
  
  // Clinical computed fields
  sleepEfficiency   Float    // Calculated: (totalSleep / timeInBed) * 100
  timeInBedDuration Int      // Minutes between inBed and outOfBed
  
  // Notes
  comments          String?
  
  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  user              User     @relation(fields: [userId], references: [id])
  
  // Indexes
  @@unique([userId, date])
  @@index([userId, date])
}

// Two-week program tracking
model SleepProgram {
  id          String   @id @default(cuid())
  userId      String
  startDate   DateTime
  endDate     DateTime?
  completed   Boolean  @default(false)
  daysLogged  Int      @default(0)
  user        User     @relation(fields: [userId], references: [id])
  
  @@index([userId, startDate])
}
```

**Migration Strategy**: 
- Create new table alongside existing SleepEntry
- Provide data migration utility for existing entries
- Maintain backward compatibility during transition

##### Analytics Service Layer
**Location**: `src/lib/analytics/`

**Services**:
- `SleepMetricsService`: Calculate statistics and trends
- `InsightsEngine`: Generate personalized recommendations
- `DataExportService`: Handle CSV/PDF generation
- `ChartDataService`: Process data for visualization

#### 1.2 API Enhancements

##### New API Endpoints
```typescript
// Analytics data
GET /api/analytics/metrics?period=30d&userId=xxx
GET /api/analytics/trends?period=3m&userId=xxx
GET /api/analytics/insights?userId=xxx

// Data export
GET /api/export/csv?start=2025-09-01&end=2025-09-30&userId=xxx
POST /api/export/pdf (generates and returns PDF)

// Dashboard data
GET /api/dashboard/stats?userId=xxx (enhanced with real calculations)
```

##### Response Caching
**Implementation**: Redis or in-memory cache for expensive calculations
**Strategy**: Cache analytics results for 1 hour, invalidate on new entries

#### 1.3 Frontend Architecture

##### Chart Library Integration
**Choice**: Recharts (React-based, TypeScript support)
**Reasoning**: 
- Excellent TypeScript support
- Responsive design
- Customizable styling to match shadcn/ui
- Good performance with moderate data sets

##### State Management
**Current**: React state and Server Components
**Enhancement**: Add React Query for API caching and synchronization

##### Component Structure
```
src/components/analytics/
├── AnalyticsDashboard.tsx
├── charts/
│   ├── SleepDurationChart.tsx
│   ├── QualityTrendChart.tsx
│   ├── ScheduleHeatmap.tsx
│   └── DurationQualityScatter.tsx
├── insights/
│   ├── WeeklyReport.tsx
│   ├── RecommendationCards.tsx
│   └── CorrelationInsights.tsx
└── export/
    ├── ExportControls.tsx
    └── ShareDialog.tsx
```

### 2. Performance Requirements

#### 2.1 Load Time Targets
- **Analytics Dashboard**: < 2 seconds initial load
- **Chart Rendering**: < 500ms per chart
- **Data Export**: < 5 seconds for CSV, < 10 seconds for PDF

#### 2.2 Data Optimization
- **Query Optimization**: Use database aggregation for statistics
- **Progressive Loading**: Load charts as user scrolls
- **Data Virtualization**: For large datasets (>1000 entries)

#### 2.3 Caching Strategy
- **API Response Cache**: 1 hour for analytics data
- **Chart Data Cache**: Client-side cache for 30 minutes
- **Static Content**: CDN for chart libraries and assets

### 3. Security & Privacy

#### 3.1 Data Access Control
- **User Isolation**: All queries filtered by authenticated userId
- **API Authentication**: Verify session on all analytics endpoints
- **Rate Limiting**: Prevent abuse of export functionality

#### 3.2 Data Privacy
- **Export Security**: Temporary signed URLs for file downloads
- **Sharing Controls**: Explicit opt-in for any data sharing
- **Data Retention**: Honor user deletion requests

## User Experience Requirements

### 1. Visual Design Standards

#### 1.1 Chart Design Principles
- **Consistency**: Match existing shadcn/ui stone color scheme
- **Accessibility**: WCAG 2.1 AA color contrast ratios
- **Responsiveness**: Mobile-first chart design with touch interactions

#### 1.2 Loading States
- **Skeleton Screens**: For charts and statistics during load
- **Progressive Loading**: Show basic stats first, then detailed charts
- **Error States**: Graceful fallbacks when data unavailable

#### 1.3 Empty States
- **First-time Users**: Onboarding flow explaining analytics benefits
- **Insufficient Data**: Clear messaging about minimum data requirements
- **No Data**: Encouraging users to add more entries

### 2. Interaction Design

#### 2.1 Navigation Flow
```
Dashboard → Analytics Tab → Specific Chart Views → Export Options
```

#### 2.2 Chart Interactions
- **Hover Effects**: Show detailed data points
- **Click-to-Filter**: Drill down into specific time periods
- **Touch Support**: Swipe and pinch gestures on mobile

#### 2.3 Mobile Optimizations
- **Responsive Charts**: Adapt to screen size
- **Touch-Friendly Controls**: Large tap targets
- **Simplified Views**: Prioritize most important metrics on mobile

## Acceptance Criteria

### Phase 0: Clinical Data Model & Entry Form (Week 1-3)
- [ ] Extend database schema for Stanford Sleep Diary compliance
- [ ] Implement comprehensive clinical sleep entry form
- [ ] Add subjective wellness parameter tracking (focus, energy, alertness, mood)
- [ ] Create two-week program enrollment and progress tracking
- [ ] Build multi-step entry process (pre-sleep, morning, daytime)
- [ ] Implement clinical data validation and quality indicators
- [ ] Add medication and substance tracking
- [ ] Create sleep efficiency and clinical metric calculations
- [ ] Maintain backward compatibility with existing entries

### Phase 1: Enhanced Clinical Dashboard (Week 4-5)
- [ ] Replace hardcoded statistics with clinical metrics (efficiency, latency, awakenings)
- [ ] Add clinical insights panel with pattern alerts
- [ ] Implement subjective wellness score tracking and correlation
- [ ] Create two-week program progress visualization
- [ ] Add sleep debt accumulation tracking
- [ ] Handle edge cases for clinical data requirements
- [ ] Maintain <2 second load time with enhanced calculations
- [ ] Pass all clinical validation tests

### Phase 2: Subjective Wellness Analytics (Week 6-7)
- [ ] Create dedicated wellness analytics dashboard at `/dashboard/analytics/wellness`
- [ ] Implement wellness trend line charts (alertness, energy, focus, mood)
- [ ] Build sleep-wellness correlation matrix and scatter plots
- [ ] Add wellness heatmap calendar view
- [ ] Create clinical sleep parameter analytics (efficiency, latency, maintenance)
- [ ] Implement 14-day time period controls
- [ ] Ensure mobile responsiveness for clinical data entry

### Phase 3: Advanced Clinical Analytics (Week 8-9)
- [ ] Implement comprehensive sleep pattern analysis charts
- [ ] Build clinical correlation analysis features
- [ ] Add personalized clinical recommendation engine
- [ ] Create automated weekly/bi-weekly clinical reports
- [ ] Implement clinical threshold monitoring and alerts
- [ ] Add medication/substance impact analysis
- [ ] Optimize performance for clinical dataset complexity

### Phase 4: Clinical Export & Medical Reporting (Week 10-11)
- [ ] Implement Stanford-compliant CSV export functionality
- [ ] Build professional clinical PDF report generation
- [ ] Create two-week program completion reports
- [ ] Add healthcare provider sharing features
- [ ] Implement clinical data privacy controls
- [ ] Create medical consultation preparation tools
- [ ] Complete end-to-end clinical workflow testing

## Success Criteria & KPIs

### Clinical Program Engagement Metrics
- **Two-Week Program Enrollment**: Target 40% of active users enroll in 14-day assessment
- **Program Completion Rate**: 70% of enrolled users complete full 14-day program
- **Clinical Data Completeness**: 90% of entries include all Stanford parameters
- **Subjective Wellness Tracking**: 80% of users complete daily wellness parameters
- **Time Spent on Wellness Analytics**: Average 5+ minutes on wellness dashboard

### Medical Relevance & Usage
- **Clinical Export Usage**: 25% of program completers export clinical reports
- **Healthcare Provider Sharing**: 15% of users share reports with medical professionals
- **Clinical Threshold Alerts**: Appropriate flagging of concerning patterns (>85% accuracy)
- **Sleep Efficiency Tracking**: Users with efficiency <85% receive targeted recommendations

### User Engagement & Retention
- **Analytics Page Views**: Target 60% of active users visit clinical analytics weekly
- **Chart Interactions**: 70% of users interact with wellness correlation charts
- **Long-term Tracking**: 35% of users continue tracking beyond initial 14-day program
- **User Retention**: 30% improvement in 30-day retention through clinical insights

### Data Quality & Clinical Accuracy
- **Entry Frequency**: 40% increase in comprehensive entries per user
- **Clinical Data Validation**: <2% error rate in sleep efficiency calculations
- **Medication Tracking**: 95% of relevant users track sleep aids and substances
- **Correlation Accuracy**: Wellness-sleep correlations match clinical research patterns

### Performance & Technical Benchmarks
- **Load Times**: 95% of clinical dashboard loads under 3 seconds
- **Complex Calculations**: Clinical metrics compute in <1 second
- **Export Generation**: PDF reports generate in <15 seconds
- **Error Rates**: <0.5% API error rate for clinical calculations
- **User Satisfaction**: 4.7+ rating for clinical features and medical relevance

## Risk Assessment & Mitigation

### Technical Risks

#### High Risk: Chart Performance with Large Datasets
**Impact**: Slow rendering, poor user experience
**Mitigation**: 
- Implement data virtualization
- Use chart data aggregation
- Add progressive loading

#### Medium Risk: Complex Correlation Calculations
**Impact**: High server load, slow API responses
**Mitigation**:
- Pre-calculate correlations during data ingestion
- Use database aggregation functions
- Implement intelligent caching

### User Experience Risks

#### Medium Risk: Information Overload
**Impact**: Users overwhelmed by too many charts/metrics
**Mitigation**:
- Progressive disclosure design
- Focus on 3-5 key insights initially
- User customization options

#### Low Risk: Insufficient Data for Insights
**Impact**: Poor recommendations for new users
**Mitigation**:
- Clear onboarding about minimum data needs
- Graceful fallbacks and educational content
- Generic recommendations based on sleep science

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
**Goal**: Transform static dashboard to dynamic

**Deliverables**:
- Enhanced dashboard with real statistics
- Basic analytics service layer
- Database query optimization
- Unit tests for analytics calculations

### Phase 2: Core Analytics (Weeks 3-4)
**Goal**: Build fundamental analytics dashboard

**Deliverables**:
- Dedicated analytics page with navigation
- Time period controls
- Primary trend charts (duration, quality)
- Mobile-responsive design

### Phase 3: Advanced Insights (Weeks 5-6)
**Goal**: Add intelligent analysis and recommendations

**Deliverables**:
- Pattern analysis charts
- Correlation insights
- Personalized recommendation engine
- Weekly/monthly reporting

### Phase 4: Export & Polish (Weeks 7-8)
**Goal**: Complete feature set and optimize

**Deliverables**:
- Data export functionality (CSV, PDF)
- Sharing capabilities
- Performance optimization
- Comprehensive testing and bug fixes

## Dependencies & Assumptions

### Technical Dependencies
- **Chart Library**: Recharts integration
- **Export Libraries**: CSV parser, PDF generation library
- **Caching**: Redis or alternative caching solution
- **API Framework**: Existing Next.js API routes

### External Dependencies
- **Google OAuth**: Continued authentication service availability
- **Database**: PostgreSQL performance for analytics queries
- **CDN**: Asset delivery for chart libraries

### Assumptions
- **User Engagement**: Users will maintain regular entry habits
- **Data Volume**: Average user has <365 entries (manageable dataset size)
- **Browser Support**: Modern browsers with ES6+ support
- **Mobile Usage**: 40%+ of users access via mobile devices

## Future Enhancements

### Version 2.0 Considerations
- **AI-Powered Insights**: Machine learning for pattern recognition
- **Wearable Integration**: Connect with fitness trackers
- **Social Features**: Community challenges and comparisons
- **Healthcare Integration**: Share with medical providers
- **Goal Tracking**: Set and monitor sleep improvement goals

### Scalability Considerations
- **Data Archiving**: Strategy for handling years of user data
- **Advanced Analytics**: More sophisticated statistical analysis
- **Real-time Updates**: WebSocket integration for live updates
- **Multi-user Analytics**: Family or team sleep tracking

---

## Conclusion

This enhanced specification transforms the Sleep Diary application from a basic tracking tool into a **clinical-grade sleep assessment platform** following Stanford Sleep Health and Insomnia Program guidelines. The comprehensive integration of subjective wellness parameters (focus, energy, alertness, mood) with traditional sleep metrics creates a medically-relevant tool suitable for healthcare consultation and sleep disorder assessment.

### Key Clinical Achievements

1. **Stanford Compliance**: Full integration of all 14 Stanford Sleep Diary parameters
2. **Two-Week Program**: Structured 14-day assessment program with progress tracking
3. **Subjective Wellness**: Novel integration of daily functioning metrics with sleep data
4. **Clinical Export**: Professional-grade reporting for healthcare provider consultations
5. **Medical Relevance**: Clinical threshold monitoring and evidence-based recommendations

### Technical Excellence & User Experience

The specification maintains the established project constitution's focus on user-centric design, technical excellence, and data privacy while elevating the application to clinical standards. The phased implementation approach ensures incremental value delivery while building toward a sophisticated, medically-relevant sleep optimization system.

### Success Measurement

Success will be measured not only through traditional engagement metrics but also through clinical relevance indicators: program completion rates, healthcare provider adoption, clinical data accuracy, and medical consultation effectiveness.

### Medical Disclaimer Integration

**Important**: The application will include appropriate medical disclaimers clarifying that it is a tracking and analysis tool, not a diagnostic instrument. Users will be encouraged to share clinical reports with qualified healthcare providers for professional sleep medicine consultation.

---

**Next Step**: Proceed with `/plan` to create a detailed implementation plan that addresses both the technical complexity and clinical accuracy requirements of this Stanford-compliant specification.
