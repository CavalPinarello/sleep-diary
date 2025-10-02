"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BookOpen, 
  Calendar, 
  Target, 
  Users, 
  CheckCircle, 
  Info, 
  ArrowRight,
  Clock,
  Award,
  BarChart3,
  Heart
} from 'lucide-react';

interface EnrollmentStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ENROLLMENT_STEPS: EnrollmentStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Stanford Sleep Health Program',
    description: 'Learn about the clinical assessment process',
    icon: <BookOpen className="w-6 h-6" />
  },
  {
    id: 'overview',
    title: 'Program Overview',
    description: 'Understand the 14-day assessment protocol',
    icon: <Calendar className="w-6 h-6" />
  },
  {
    id: 'commitment',
    title: 'Your Commitment',
    description: 'Daily tracking requirements and expectations',
    icon: <Target className="w-6 h-6" />
  },
  {
    id: 'goals',
    title: 'Set Your Goals',
    description: 'Define what you want to achieve',
    icon: <Award className="w-6 h-6" />
  },
  {
    id: 'enroll',
    title: 'Start Your Program',
    description: 'Complete enrollment and begin tracking',
    icon: <CheckCircle className="w-6 h-6" />
  }
];

interface ProgramGoal {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'sleep' | 'health' | 'performance';
}

const PROGRAM_GOALS: ProgramGoal[] = [
  {
    id: 'sleep-quality',
    title: 'Improve Sleep Quality',
    description: 'Understand and enhance your sleep patterns',
    icon: <Heart className="w-5 h-5" />,
    category: 'sleep'
  },
  {
    id: 'sleep-duration',
    title: 'Optimize Sleep Duration',
    description: 'Find your ideal amount of sleep',
    icon: <Clock className="w-5 h-5" />,
    category: 'sleep'
  },
  {
    id: 'daytime-energy',
    title: 'Increase Daytime Energy',
    description: 'Feel more alert and energetic during the day',
    icon: <BarChart3 className="w-5 h-5" />,
    category: 'performance'
  },
  {
    id: 'sleep-disorders',
    title: 'Screen for Sleep Disorders',
    description: 'Identify potential sleep-related health issues',
    icon: <Users className="w-5 h-5" />,
    category: 'health'
  },
  {
    id: 'mood-focus',
    title: 'Enhance Mood & Focus',
    description: 'Improve cognitive performance and emotional well-being',
    icon: <Target className="w-5 h-5" />,
    category: 'performance'
  },
  {
    id: 'sleep-hygiene',
    title: 'Build Better Sleep Habits',
    description: 'Develop consistent, healthy sleep routines',
    icon: <CheckCircle className="w-5 h-5" />,
    category: 'sleep'
  }
];

interface EnrollmentData {
  programName?: string;
  selectedGoals: string[];
  notifications: boolean;
  startDate?: string;
  notes?: string;
}

export function ProgramEnrollmentWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({
    selectedGoals: [],
    notifications: true
  });
  const [isEnrolling, setIsEnrolling] = useState(false);

  const currentStepData = ENROLLMENT_STEPS[currentStep];
  const isLastStep = currentStep === ENROLLMENT_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (currentStep < ENROLLMENT_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoalToggle = (goalId: string) => {
    setEnrollmentData(prev => ({
      ...prev,
      selectedGoals: prev.selectedGoals.includes(goalId)
        ? prev.selectedGoals.filter(id => id !== goalId)
        : [...prev.selectedGoals, goalId]
    }));
  };

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      // Create new program
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: enrollmentData.programName || 'Stanford Sleep Health Program',
          goals: enrollmentData.selectedGoals,
          startDate: enrollmentData.startDate || new Date().toISOString().split('T')[0],
          notifications: enrollmentData.notifications,
          notes: enrollmentData.notes
        })
      });

      if (response.ok) {
        const program = await response.json();
        // Redirect to program dashboard
        router.push(`/dashboard/programs/${program.id}`);
      } else {
        throw new Error('Failed to create program');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to enroll in program. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const canProceed = () => {
    switch (currentStepData.id) {
      case 'goals':
        return enrollmentData.selectedGoals.length > 0;
      case 'enroll':
        return enrollmentData.selectedGoals.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Stanford Sleep Health Program</h1>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {ENROLLMENT_STEPS.length}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {ENROLLMENT_STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`
                  flex items-center space-x-2 p-2 rounded-lg transition-all
                  ${index === currentStep 
                    ? 'bg-blue-100 text-blue-800' 
                    : index < currentStep
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-500'
                  }
                `}>
                  {index < currentStep ? <CheckCircle className="w-5 h-5" /> : step.icon}
                  <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                </div>
                {index < ENROLLMENT_STEPS.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {currentStepData.icon}
            <span>{currentStepData.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Welcome Step */}
          {currentStepData.id === 'welcome' && (
            <WelcomeStep />
          )}
          
          {/* Overview Step */}
          {currentStepData.id === 'overview' && (
            <OverviewStep />
          )}
          
          {/* Commitment Step */}
          {currentStepData.id === 'commitment' && (
            <CommitmentStep />
          )}
          
          {/* Goals Step */}
          {currentStepData.id === 'goals' && (
            <GoalsStep 
              selectedGoals={enrollmentData.selectedGoals}
              onGoalToggle={handleGoalToggle}
            />
          )}
          
          {/* Enrollment Step */}
          {currentStepData.id === 'enroll' && (
            <EnrollmentStep 
              data={enrollmentData}
              onChange={setEnrollmentData}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={isFirstStep ? () => router.push('/dashboard') : handlePrevious}
              disabled={isEnrolling}
            >
              {isFirstStep ? 'Back to Dashboard' : 'Previous'}
            </Button>
            
            <Button
              onClick={isLastStep ? handleEnroll : handleNext}
              disabled={!canProceed() || isEnrolling}
            >
              {isEnrolling 
                ? 'Enrolling...' 
                : isLastStep 
                  ? 'Start Program' 
                  : 'Next'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Individual step components
function WelcomeStep() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-2xl font-semibold">Welcome to Evidence-Based Sleep Assessment</h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          The Stanford Sleep Health Program is a clinically validated 14-day assessment designed 
          to comprehensively evaluate your sleep patterns and their impact on daily life.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Clinically Proven</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Developed by Stanford Sleep Medicine specialists, this program uses validated 
              assessment tools trusted by healthcare professionals worldwide.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span>Comprehensive Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track not just sleep duration, but sleep efficiency, quality, daytime impact, 
              and potential indicators of sleep disorders.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span>Personalized Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Receive evidence-based recommendations tailored to your specific sleep patterns 
              and health goals.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-600" />
              <span>Health-Focused</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Identify potential sleep disorders early and understand how sleep affects your 
              overall health and well-being.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-800">What makes this different?</h5>
            <p className="text-sm text-blue-700 mt-1">
              Unlike simple sleep trackers, this program captures the same clinical parameters 
              used in professional sleep medicine assessments, providing medical-grade insights 
              into your sleep health.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewStep() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <Calendar className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-semibold">14-Day Clinical Assessment Protocol</h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A structured two-week program designed to capture comprehensive sleep patterns 
          and identify trends that might not be apparent from single-night observations.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">1</span>
                </div>
                <span>Evening Entry</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Record bedtime routine, medications, and pre-sleep activities. 
                Takes 2-3 minutes before bed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-green-600">2</span>
                </div>
                <span>Morning Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Complete comprehensive sleep evaluation within 1-2 hours of waking. 
                Takes 5-7 minutes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-600">3</span>
                </div>
                <span>Evening Wellness</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Rate daytime energy, mood, focus, and alertness. 
                Takes 1-2 minutes before next bedtime.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">What You&apos;ll Track Daily:</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-gray-800 mb-2">Sleep Architecture</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Sleep timing and duration</li>
                <li>• Sleep latency (time to fall asleep)</li>
                <li>• Night awakenings and duration</li>
                <li>• Sleep efficiency calculations</li>
                <li>• Early morning awakenings</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-800 mb-2">Daily Impact</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Morning alertness and restedness</li>
                <li>• Daytime energy levels</li>
                <li>• Cognitive focus and clarity</li>
                <li>• Emotional well-being</li>
                <li>• Pre-sleep activities and habits</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-amber-800">Time Commitment</h5>
              <p className="text-sm text-amber-700 mt-1">
                Total daily time: 8-12 minutes across three brief sessions. 
                The program is designed to fit seamlessly into your existing routine.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommitmentStep() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
          <Target className="w-10 h-10 text-purple-600" />
        </div>
        <h3 className="text-2xl font-semibold">Your Commitment to Success</h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Consistent tracking is essential for accurate clinical assessment. 
          Here&apos;s what we ask of you during the 14-day program.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Daily Tracking Requirements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">≥85%</div>
                <div className="text-sm font-medium">Minimum Completion</div>
                <div className="text-xs text-muted-foreground mt-1">12+ days of 14</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">3x</div>
                <div className="text-sm font-medium">Daily Entries</div>
                <div className="text-xs text-muted-foreground mt-1">Evening, Morning, Wellness</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">24h</div>
                <div className="text-sm font-medium">Entry Window</div>
                <div className="text-xs text-muted-foreground mt-1">Complete within 24 hours</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-600" />
              <span>Success Milestones</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">3</span>
                </div>
                <div>
                  <div className="font-medium">First Milestone</div>
                  <div className="text-sm text-muted-foreground">Complete 3 consecutive days</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-green-600">7</span>
                </div>
                <div>
                  <div className="font-medium">Week One Complete</div>
                  <div className="text-sm text-muted-foreground">Establish baseline patterns</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-600">14</span>
                </div>
                <div>
                  <div className="font-medium">Program Graduate</div>
                  <div className="text-sm text-muted-foreground">Full clinical assessment complete</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-green-800">We&apos;re Here to Support You</h5>
              <p className="text-sm text-green-700 mt-1">
                You&apos;ll receive daily reminders, progress updates, and motivational milestones. 
                The program is designed to be sustainable and fit into your life, not disrupt it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface GoalsStepProps {
  selectedGoals: string[];
  onGoalToggle: (goalId: string) => void;
}

function GoalsStep({ selectedGoals, onGoalToggle }: GoalsStepProps) {
  const goalsByCategory = {
    sleep: PROGRAM_GOALS.filter(g => g.category === 'sleep'),
    health: PROGRAM_GOALS.filter(g => g.category === 'health'),
    performance: PROGRAM_GOALS.filter(g => g.category === 'performance')
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
          <Award className="w-10 h-10 text-yellow-600" />
        </div>
        <h3 className="text-2xl font-semibold">Define Your Sleep Health Goals</h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the goals that matter most to you. This helps us provide more targeted 
          insights and recommendations throughout your program.
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(goalsByCategory).map(([category, goals]) => (
          <div key={category}>
            <h4 className="font-semibold text-gray-900 mb-3 capitalize">
              {category === 'sleep' ? 'Sleep Optimization' : 
               category === 'health' ? 'Health Assessment' : 
               'Performance Enhancement'}
            </h4>
            
            <div className="grid md:grid-cols-2 gap-3">
              {goals.map(goal => (
                <Card 
                  key={goal.id}
                  className={`cursor-pointer transition-all ${
                    selectedGoals.includes(goal.id) 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onGoalToggle(goal.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`
                        p-2 rounded-lg
                        ${selectedGoals.includes(goal.id) 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        {goal.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{goal.title}</h5>
                          {selectedGoals.includes(goal.id) && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {goal.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedGoals.length === 0 && (
        <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800">
            Please select at least one goal to continue with your program enrollment.
          </p>
        </div>
      )}

      {selectedGoals.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-green-800">
                {selectedGoals.length} Goal{selectedGoals.length > 1 ? 's' : ''} Selected
              </h5>
              <p className="text-sm text-green-700 mt-1">
                Your personalized program will focus on these areas with targeted insights 
                and recommendations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface EnrollmentStepProps {
  data: EnrollmentData;
  onChange: (data: EnrollmentData) => void;
}

function EnrollmentStep({ data, onChange }: EnrollmentStepProps) {
  const selectedGoalTitles = PROGRAM_GOALS
    .filter(goal => data.selectedGoals.includes(goal.id))
    .map(goal => goal.title);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-semibold">Ready to Begin Your Sleep Health Journey</h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Complete your enrollment details to start your 14-day Stanford Sleep Health Program.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="programName">Program Name (Optional)</Label>
            <Input
              id="programName"
              placeholder="e.g., My Sleep Improvement Journey"
              value={data.programName || ''}
              onChange={(e) => onChange({ ...data, programName: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use default: &quot;Stanford Sleep Health Program&quot;
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={data.startDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => onChange({ ...data, startDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-muted-foreground">
              Your program will run for 14 consecutive days starting from this date
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="notifications"
              checked={data.notifications}
              onChange={(e) => onChange({ ...data, notifications: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="notifications" className="text-sm">
              Send me daily reminders and progress updates
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <textarea
              id="notes"
              placeholder="Any specific sleep concerns or context you'd like to track..."
              value={data.notes || ''}
              onChange={(e) => onChange({ ...data, notes: e.target.value })}
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Program Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Duration</h5>
              <p className="text-sm text-gray-600">14 consecutive days</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Daily Commitment</h5>
              <p className="text-sm text-gray-600">8-12 minutes total</p>
            </div>
          </div>

          <div>
            <h5 className="font-medium text-gray-900 mb-2">Your Selected Goals</h5>
            <div className="flex flex-wrap gap-2">
              {selectedGoalTitles.map(title => (
                <span
                  key={title}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {title}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-800">Ready to Start?</h5>
                <p className="text-sm text-blue-700 mt-1">
                  Click &quot;Start Program&quot; to begin your Stanford Sleep Health assessment. 
                  You&apos;ll be taken to your personalized program dashboard where you can 
                  make your first entry.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}