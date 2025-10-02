"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ClinicalValidator, 
  type ClinicalSleepEntryInput, 
  type ValidationResult 
} from '@/lib/clinical';
import { Clock, Moon, Sun, Brain, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// Form data interface matching our clinical model
interface ClinicalFormData {
  // Core timing
  date: string;
  timeInBed: string;
  sleepAttemptTime: string;
  finalWakeTime: string;
  outOfBedTime: string;
  
  // Sleep metrics
  totalSleepHours: number;
  totalSleepMins: number;
  sleepLatencyHours: number;
  sleepLatencyMins: number;
  
  // Night disruptions
  nightAwakenings: number;
  awakeningDurHours: number;
  awakeningDurMins: number;
  earlyAwakening: boolean;
  earlyAwakeHours: number;
  earlyAwakeMins: number;
  
  // Subjective assessments (Stanford scales)
  sleepQuality: number; // 1-5
  morningRestedness: number; // 1-4
  
  // Previous day factors
  prevDayNapHours: number;
  prevDayNapMins: number;
  
  // Pre-sleep activities
  preSleepReading: boolean;
  preSleepTV: boolean;
  preSleepOther: string;
  
  // Wellness metrics (1-10)
  morningAlertness: number;
  daytimeEnergy: number;
  daytimeFocus: number;
  daytimeMood: number;
  
  // Additional
  sleepMedications: string;
  comments: string;
}

// Form step definitions
type FormStep = 'evening' | 'morning' | 'wellness' | 'review';

interface StepConfig {
  id: FormStep;
  title: string;
  description: string;
  icon: React.ReactNode;
  optional?: boolean;
}

const FORM_STEPS: StepConfig[] = [
  {
    id: 'evening',
    title: 'Evening Preparation',
    description: 'Pre-sleep activities and bedtime routine',
    icon: <Moon className="w-5 h-5" />
  },
  {
    id: 'morning',
    title: 'Morning Assessment',
    description: 'Sleep timing and quality evaluation',
    icon: <Sun className="w-5 h-5" />
  },
  {
    id: 'wellness',
    title: 'Wellness Check',
    description: 'Daytime energy and mood assessment',
    icon: <Brain className="w-5 h-5" />,
    optional: true
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Verify your entries and clinical insights',
    icon: <CheckCircle className="w-5 h-5" />
  }
];

// Default form data
const getDefaultFormData = (): ClinicalFormData => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  
  return {
    date: yesterday.toISOString().split('T')[0],
    timeInBed: '23:00',
    sleepAttemptTime: '23:15',
    finalWakeTime: '07:00',
    outOfBedTime: '07:30',
    totalSleepHours: 7,
    totalSleepMins: 30,
    sleepLatencyHours: 0,
    sleepLatencyMins: 15,
    nightAwakenings: 1,
    awakeningDurHours: 0,
    awakeningDurMins: 5,
    earlyAwakening: false,
    earlyAwakeHours: 0,
    earlyAwakeMins: 0,
    sleepQuality: 3,
    morningRestedness: 3,
    prevDayNapHours: 0,
    prevDayNapMins: 0,
    preSleepReading: false,
    preSleepTV: false,
    preSleepOther: '',
    morningAlertness: 6,
    daytimeEnergy: 6,
    daytimeFocus: 6,
    daytimeMood: 6,
    sleepMedications: '',
    comments: ''
  };
};

interface ClinicalEntryWizardProps {
  initialData?: Partial<ClinicalFormData>;
  onSubmit?: (data: ClinicalFormData) => Promise<void>;
  onCancel?: () => void;
}

export function ClinicalEntryWizard({ 
  initialData, 
  onSubmit,
  onCancel 
}: ClinicalEntryWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>('evening');
  const [formData, setFormData] = useState<ClinicalFormData>(() => ({
    ...getDefaultFormData(),
    ...initialData
  }));
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form on data changes
  useEffect(() => {
    validateCurrentData();
  }, [formData]); // validateCurrentData is defined inline, dependency is acceptable

  const validateCurrentData = () => {
    try {
      const clinicalInput: ClinicalSleepEntryInput = {
        date: new Date(formData.date),
        timeInBed: new Date(`${formData.date}T${formData.timeInBed}`),
        sleepAttemptTime: new Date(`${formData.date}T${formData.sleepAttemptTime}`),
        finalWakeTime: new Date(`${formData.date}T${formData.finalWakeTime}`),
        outOfBedTime: new Date(`${formData.date}T${formData.outOfBedTime}`),
        totalSleepHours: formData.totalSleepHours,
        totalSleepMins: formData.totalSleepMins,
        sleepLatencyHours: formData.sleepLatencyHours,
        sleepLatencyMins: formData.sleepLatencyMins,
        nightAwakenings: formData.nightAwakenings,
        awakeningDurHours: formData.awakeningDurHours,
        awakeningDurMins: formData.awakeningDurMins,
        prevDayNapHours: formData.prevDayNapHours,
        prevDayNapMins: formData.prevDayNapMins,
        preSleepReading: formData.preSleepReading,
        preSleepTV: formData.preSleepTV,
        preSleepOther: formData.preSleepOther,
        earlyAwakening: formData.earlyAwakening,
        earlyAwakeHours: formData.earlyAwakeHours,
        earlyAwakeMins: formData.earlyAwakeMins,
        sleepQuality: formData.sleepQuality,
        morningRestedness: formData.morningRestedness,
        morningAlertness: formData.morningAlertness,
        daytimeEnergy: formData.daytimeEnergy,
        daytimeFocus: formData.daytimeFocus,
        daytimeMood: formData.daytimeMood,
        sleepMedications: formData.sleepMedications,
        comments: formData.comments
      };

      const result = ClinicalValidator.validateSleepEntry(clinicalInput);
      setValidation(result);
    } catch (error) {
      console.error('Validation error:', error);
      setValidation({
        isValid: false,
        errors: [{ field: 'general', message: 'Validation error occurred' }],
        warnings: [],
        clinicalFlags: []
      });
    }
  };

  const updateFormData = (updates: Partial<ClinicalFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const getCurrentStepIndex = () => FORM_STEPS.findIndex(step => step.id === currentStep);
  const isLastStep = () => currentStep === 'review';
  const isFirstStep = () => currentStep === 'evening';

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < FORM_STEPS.length - 1) {
      setCurrentStep(FORM_STEPS[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(FORM_STEPS[currentIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    if (!validation?.isValid) return;
    
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default API submission
        const response = await fetch('/api/clinical-entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error(`Failed to save entry: ${response.statusText}`);
        }
        
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/dashboard');
    }
  };

  // Skip to step function for navigation
  const skipToStep = (stepId: FormStep) => {
    setCurrentStep(stepId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {FORM_STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = getCurrentStepIndex() > index;
              const isAccessible = index <= getCurrentStepIndex() + 1;
              
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => isAccessible && skipToStep(step.id)}
                    disabled={!isAccessible}
                    className={`
                      flex flex-col items-center space-y-2 p-3 rounded-lg transition-all
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : isCompleted
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : isAccessible
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : step.icon}
                      {step.optional && <span className="text-xs">(Optional)</span>}
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{step.title}</div>
                      <div className="text-xs opacity-75">{step.description}</div>
                    </div>
                  </button>
                  {index < FORM_STEPS.length - 1 && (
                    <div className={`
                      h-0.5 flex-1 mx-2 rounded
                      ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}
                    `} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {validation && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {/* Errors */}
              {validation.errors.length > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-800">Validation Errors</div>
                    <ul className="mt-1 text-sm text-red-700 space-y-1">
                      {validation.errors.map((error, idx) => (
                        <li key={idx}>• {error.message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Clinical Flags */}
              {validation.clinicalFlags.length > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-amber-800">Clinical Insights</div>
                    <ul className="mt-1 text-sm text-amber-700 space-y-1">
                      {validation.clinicalFlags.map((flag, idx) => (
                        <li key={idx}>
                          <strong>{flag.type}:</strong> {flag.message}
                          {flag.recommendedAction && (
                            <div className="text-xs mt-1 italic">→ {flag.recommendedAction}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Steps Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {FORM_STEPS.find(s => s.id === currentStep)?.icon}
            <span>{FORM_STEPS.find(s => s.id === currentStep)?.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step content components will be rendered here */}
          {currentStep === 'evening' && (
            <EveningStepForm data={formData} onChange={updateFormData} />
          )}
          {currentStep === 'morning' && (
            <MorningStepForm data={formData} onChange={updateFormData} />
          )}
          {currentStep === 'wellness' && (
            <WellnessStepForm data={formData} onChange={updateFormData} />
          )}
          {currentStep === 'review' && (
            <ReviewStepForm data={formData} validation={validation} />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={isFirstStep() ? handleCancel : handlePrevious}
              disabled={isSubmitting}
            >
              {isFirstStep() ? 'Cancel' : 'Previous'}
            </Button>
            
            <div className="flex space-x-2">
              {!isLastStep() && (
                <Button 
                  variant="outline"
                  onClick={() => skipToStep('review')}
                  disabled={isSubmitting}
                >
                  Skip to Review
                </Button>
              )}
              
              <Button
                onClick={isLastStep() ? handleSubmit : handleNext}
                disabled={isSubmitting || (isLastStep() && !validation?.isValid)}
              >
                {isSubmitting 
                  ? 'Saving...' 
                  : isLastStep() 
                    ? 'Save Entry' 
                    : 'Next'
                }
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Individual step form components
interface StepFormProps {
  data: ClinicalFormData;
  onChange: (updates: Partial<ClinicalFormData>) => void;
}

function EveningStepForm({ data, onChange }: StepFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Pre-Sleep Preparation</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Record your bedtime routine and activities before attempting to sleep.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Sleep Date</Label>
        <Input
          type="date"
          id="date"
          value={data.date}
          onChange={(e) => onChange({ date: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          The date you went to bed (not when you woke up)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="timeInBed">Time Got Into Bed</Label>
          <Input
            type="time"
            id="timeInBed"
            value={data.timeInBed}
            onChange={(e) => onChange({ timeInBed: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sleepAttemptTime">Time Attempted Sleep</Label>
          <Input
            type="time"
            id="sleepAttemptTime"
            value={data.sleepAttemptTime}
            onChange={(e) => onChange({ sleepAttemptTime: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base">Pre-Sleep Activities (check all that apply)</Label>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={data.preSleepReading}
              onChange={(e) => onChange({ preSleepReading: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span>Reading</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={data.preSleepTV}
              onChange={(e) => onChange({ preSleepTV: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span>Watching TV/Screens</span>
          </label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="preSleepOther">Other Activities</Label>
          <Input
            type="text"
            id="preSleepOther"
            value={data.preSleepOther}
            onChange={(e) => onChange({ preSleepOther: e.target.value })}
            placeholder="e.g., meditation, music, phone calls"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sleepMedications">Sleep Medications/Substances</Label>
        <Input
          type="text"
          id="sleepMedications"
          value={data.sleepMedications}
          onChange={(e) => onChange({ sleepMedications: e.target.value })}
          placeholder="e.g., melatonin 3mg at 10pm, alcohol 2 drinks"
        />
        <p className="text-xs text-muted-foreground">
          Include any medications, supplements, alcohol, or caffeine
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Previous Day Factors</h4>
        
        <div className="space-y-4">
          <Label className="text-sm">Did you nap yesterday?</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prevDayNapHours">Nap Hours</Label>
              <Input
                type="number"
                id="prevDayNapHours"
                min="0"
                max="12"
                value={data.prevDayNapHours}
                onChange={(e) => onChange({ prevDayNapHours: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prevDayNapMins">Nap Minutes</Label>
              <Input
                type="number"
                id="prevDayNapMins"
                min="0"
                max="59"
                value={data.prevDayNapMins}
                onChange={(e) => onChange({ prevDayNapMins: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MorningStepForm({ data, onChange }: StepFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Morning Assessment</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Complete this section when you wake up, ideally within 1-2 hours.
        </p>
      </div>

      {/* Sleep Timing */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>Sleep Timing</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="finalWakeTime">Final Wake Time</Label>
            <Input
              type="time"
              id="finalWakeTime"
              value={data.finalWakeTime}
              onChange={(e) => onChange({ finalWakeTime: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="outOfBedTime">Out of Bed Time</Label>
            <Input
              type="time"
              id="outOfBedTime"
              value={data.outOfBedTime}
              onChange={(e) => onChange({ outOfBedTime: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Sleep Duration */}
      <div className="space-y-4">
        <h4 className="font-medium">Total Sleep Time</h4>
        <p className="text-sm text-muted-foreground">
          Estimate your actual sleep time (excluding time awake in bed)
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalSleepHours">Hours</Label>
            <Input
              type="number"
              id="totalSleepHours"
              min="0"
              max="23"
              value={data.totalSleepHours}
              onChange={(e) => onChange({ totalSleepHours: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalSleepMins">Minutes</Label>
            <Input
              type="number"
              id="totalSleepMins"
              min="0"
              max="59"
              value={data.totalSleepMins}
              onChange={(e) => onChange({ totalSleepMins: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      {/* Sleep Latency */}
      <div className="space-y-4">
        <h4 className="font-medium">Time to Fall Asleep</h4>
        <p className="text-sm text-muted-foreground">
          How long did it take from trying to sleep until you fell asleep?
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sleepLatencyHours">Hours</Label>
            <Input
              type="number"
              id="sleepLatencyHours"
              min="0"
              max="12"
              value={data.sleepLatencyHours}
              onChange={(e) => onChange({ sleepLatencyHours: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sleepLatencyMins">Minutes</Label>
            <Input
              type="number"
              id="sleepLatencyMins"
              min="0"
              max="59"
              value={data.sleepLatencyMins}
              onChange={(e) => onChange({ sleepLatencyMins: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      {/* Night Awakenings */}
      <div className="space-y-4">
        <h4 className="font-medium">Night Awakenings</h4>
        
        <div className="space-y-2">
          <Label htmlFor="nightAwakenings">Number of Times You Woke Up</Label>
          <Input
            type="number"
            id="nightAwakenings"
            min="0"
            max="20"
            value={data.nightAwakenings}
            onChange={(e) => onChange({ nightAwakenings: parseInt(e.target.value) || 0 })}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="awakeningDurHours">Total Awakening Time (Hours)</Label>
            <Input
              type="number"
              id="awakeningDurHours"
              min="0"
              max="12"
              value={data.awakeningDurHours}
              onChange={(e) => onChange({ awakeningDurHours: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="awakeningDurMins">Minutes</Label>
            <Input
              type="number"
              id="awakeningDurMins"
              min="0"
              max="59"
              value={data.awakeningDurMins}
              onChange={(e) => onChange({ awakeningDurMins: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      {/* Early Awakening */}
      <div className="space-y-4">
        <h4 className="font-medium">Early Morning Awakening</h4>
        
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={data.earlyAwakening}
            onChange={(e) => onChange({ earlyAwakening: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span>I woke up earlier than planned and couldn&apos;t get back to sleep</span>
        </label>
        
        {data.earlyAwakening && (
          <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-gray-200">
            <div className="space-y-2">
              <Label htmlFor="earlyAwakeHours">Hours Earlier</Label>
              <Input
                type="number"
                id="earlyAwakeHours"
                min="0"
                max="12"
                value={data.earlyAwakeHours}
                onChange={(e) => onChange({ earlyAwakeHours: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="earlyAwakeMins">Minutes Earlier</Label>
              <Input
                type="number"
                id="earlyAwakeMins"
                min="0"
                max="59"
                value={data.earlyAwakeMins}
                onChange={(e) => onChange({ earlyAwakeMins: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Subjective Assessments */}
      <div className="space-y-6">
        <h4 className="font-medium">Sleep Quality Assessment</h4>
        
        {/* Sleep Quality (1-5 Stanford Scale) */}
        <div className="space-y-3">
          <Label htmlFor="sleepQuality">Overall Sleep Quality</Label>
          <div className="space-y-2">
            <input
              type="range"
              id="sleepQuality"
              min="1"
              max="5"
              value={data.sleepQuality}
              onChange={(e) => onChange({ sleepQuality: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 - Very Poor</span>
              <span className="font-medium">Current: {data.sleepQuality}</span>
              <span>5 - Very Good</span>
            </div>
          </div>
        </div>
        
        {/* Morning Restedness (1-4 Stanford Scale) */}
        <div className="space-y-3">
          <Label htmlFor="morningRestedness">Morning Restedness</Label>
          <div className="space-y-2">
            <input
              type="range"
              id="morningRestedness"
              min="1"
              max="4"
              value={data.morningRestedness}
              onChange={(e) => onChange({ morningRestedness: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 - Not Rested</span>
              <span className="font-medium">Current: {data.morningRestedness}</span>
              <span>4 - Well Rested</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments">Additional Notes</Label>
        <textarea
          id="comments"
          value={data.comments}
          onChange={(e) => onChange({ comments: e.target.value })}
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Dreams, sleep disruptions, factors that may have affected sleep..."
        />
      </div>
    </div>
  );
}

function WellnessStepForm({ data, onChange }: StepFormProps) {
  const wellnessFields = [
    {
      key: 'morningAlertness' as keyof ClinicalFormData,
      label: 'Morning Alertness',
      description: 'How alert and awake did you feel upon waking up?',
      lowLabel: 'Very Drowsy',
      highLabel: 'Fully Alert'
    },
    {
      key: 'daytimeEnergy' as keyof ClinicalFormData,
      label: 'Daytime Energy',
      description: 'Rate your overall energy level throughout the day',
      lowLabel: 'No Energy',
      highLabel: 'Full Energy'
    },
    {
      key: 'daytimeFocus' as keyof ClinicalFormData,
      label: 'Cognitive Focus',
      description: 'How was your concentration and mental clarity?',
      lowLabel: 'Cannot Focus',
      highLabel: 'Sharp Focus'
    },
    {
      key: 'daytimeMood' as keyof ClinicalFormData,
      label: 'Overall Mood',
      description: 'Rate your emotional well-being during the day',
      lowLabel: 'Poor Mood',
      highLabel: 'Great Mood'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Wellness Assessment</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Rate how you felt during the day following this sleep period. Complete this in the evening or before bed.
        </p>
      </div>

      <div className="space-y-8">
        {wellnessFields.map((field) => (
          <div key={field.key} className="space-y-3">
            <div>
              <Label className="text-base font-medium">{field.label}</Label>
              <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
            </div>
            
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="10"
                value={data[field.key] as number}
                onChange={(e) => onChange({ [field.key]: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 - {field.lowLabel}</span>
                <span className="font-medium">Current: {data[field.key]}/10</span>
                <span>10 - {field.highLabel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-blue-800">About Wellness Metrics</div>
            <p className="text-sm text-blue-700 mt-1">
              These metrics help identify how your sleep quality affects your daily functioning. 
              Tracking these patterns over time can reveal important connections between sleep and well-being.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReviewStepProps {
  data: ClinicalFormData;
  validation: ValidationResult | null;
}

function ReviewStepForm({ data, validation }: ReviewStepProps) {
  // Calculate some key metrics for display
  const totalSleepMinutes = (data.totalSleepHours * 60) + data.totalSleepMins;
  // const sleepLatencyMinutes = (data.sleepLatencyHours * 60) + data.sleepLatencyMins;
  // const awakeningMinutes = (data.awakeningDurHours * 60) + data.awakeningDurMins;
  
  // Rough sleep efficiency calculation for display
  const timeInBedStart = new Date(`${data.date}T${data.timeInBed}`);
  const timeInBedEnd = new Date(`${data.date}T${data.outOfBedTime}`);
  if (timeInBedEnd < timeInBedStart) timeInBedEnd.setDate(timeInBedEnd.getDate() + 1);
  const timeInBedMinutes = (timeInBedEnd.getTime() - timeInBedStart.getTime()) / (1000 * 60);
  const sleepEfficiency = timeInBedMinutes > 0 ? (totalSleepMinutes / timeInBedMinutes) * 100 : 0;

  const formatTime = (hours: number, minutes: number) => {
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Review Your Entry</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Please review your sleep diary entry and clinical insights before submitting.
        </p>
      </div>

      {/* Key Sleep Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-2xl font-bold text-blue-700">
            {formatTime(data.totalSleepHours, data.totalSleepMins)}
          </div>
          <div className="text-sm text-blue-600">Total Sleep Time</div>
        </div>
        
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-2xl font-bold text-green-700">
            {sleepEfficiency.toFixed(1)}%
          </div>
          <div className="text-sm text-green-600">Sleep Efficiency</div>
        </div>
        
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="text-2xl font-bold text-purple-700">
            {data.sleepQuality}/5
          </div>
          <div className="text-sm text-purple-600">Sleep Quality</div>
        </div>
      </div>

      {/* Detailed Summary */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sleep Timing */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Sleep Timing</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{new Date(data.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time in bed:</span>
                <span>{data.timeInBed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sleep attempt:</span>
                <span>{data.sleepAttemptTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Final wake:</span>
                <span>{data.finalWakeTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Out of bed:</span>
                <span>{data.outOfBedTime}</span>
              </div>
            </div>
          </div>

          {/* Sleep Architecture */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Sleep Architecture</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sleep latency:</span>
                <span>{formatTime(data.sleepLatencyHours, data.sleepLatencyMins)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Night awakenings:</span>
                <span>{data.nightAwakenings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Awakening duration:</span>
                <span>{formatTime(data.awakeningDurHours, data.awakeningDurMins)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Morning restedness:</span>
                <span>{data.morningRestedness}/4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wellness Metrics */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Wellness Metrics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-semibold">{data.morningAlertness}/10</div>
              <div className="text-xs text-gray-600">Morning Alertness</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-semibold">{data.daytimeEnergy}/10</div>
              <div className="text-xs text-gray-600">Daytime Energy</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-semibold">{data.daytimeFocus}/10</div>
              <div className="text-xs text-gray-600">Cognitive Focus</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-semibold">{data.daytimeMood}/10</div>
              <div className="text-xs text-gray-600">Overall Mood</div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {(data.preSleepReading || data.preSleepTV || data.preSleepOther || data.sleepMedications || data.comments) && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Additional Information</h4>
            <div className="space-y-2 text-sm">
              {(data.preSleepReading || data.preSleepTV) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Pre-sleep activities:</span>
                  <span>
                    {[
                      data.preSleepReading && 'Reading',
                      data.preSleepTV && 'TV/Screens'
                    ].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              {data.preSleepOther && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Other activities:</span>
                  <span>{data.preSleepOther}</span>
                </div>
              )}
              {data.sleepMedications && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Medications:</span>
                  <span>{data.sleepMedications}</span>
                </div>
              )}
              {data.comments && (
                <div>
                  <span className="text-gray-600">Notes:</span>
                  <p className="mt-1 text-gray-900">{data.comments}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Validation Status */}
      <div className="border-t pt-4">
        {validation?.isValid ? (
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Entry validated successfully</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Please address validation issues above before submitting</span>
          </div>
        )}
      </div>
    </div>
  );
}