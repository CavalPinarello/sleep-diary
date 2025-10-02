/**
 * Enhanced Form Fields for Clinical Sleep Diary
 * Provides standardized form components with validation feedback and clinical context
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface BaseFieldProps {
  id: string;
  label: string;
  description?: string;
  clinicalNote?: string;
  error?: string;
  warning?: string;
  required?: boolean;
  className?: string;
}

interface TimeFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface NumberFieldProps extends BaseFieldProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

interface SliderFieldProps extends BaseFieldProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  labels?: { [key: number]: string };
  showValue?: boolean;
}

interface CheckboxFieldProps extends BaseFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface TextAreaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  maxLength?: number;
}

// Base field wrapper with consistent styling and validation display
const FieldWrapper: React.FC<{
  children: React.ReactNode;
  label: string;
  id: string;
  description?: string;
  clinicalNote?: string;
  error?: string;
  warning?: string;
  required?: boolean;
  className?: string;
}> = ({
  children,
  label,
  id,
  description,
  clinicalNote,
  error,
  warning,
  required,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="flex items-center space-x-1">
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
        {clinicalNote && (
          <div className="group relative">
            <HelpCircle className="w-4 h-4 text-blue-500 cursor-help" />
            <div className="absolute left-full ml-2 top-0 z-10 invisible group-hover:visible bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-800 whitespace-nowrap max-w-xs">
              {clinicalNote}
            </div>
          </div>
        )}
      </Label>
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {children}
      
      {/* Validation Messages */}
      {error && (
        <div className="flex items-start space-x-2 text-sm text-red-600">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {warning && !error && (
        <div className="flex items-start space-x-2 text-sm text-amber-600">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{warning}</span>
        </div>
      )}
    </div>
  );
};

// Time input field (HH:MM format)
export const ClinicalTimeField: React.FC<TimeFieldProps> = ({
  id,
  label,
  value,
  onChange,
  description,
  clinicalNote,
  error,
  warning,
  required,
  placeholder = "12:00",
  className
}) => {
  return (
    <FieldWrapper
      id={id}
      label={label}
      description={description}
      clinicalNote={clinicalNote}
      error={error}
      warning={warning}
      required={required}
      className={className}
    >
      <Input
        type="time"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? 'border-red-500 focus:border-red-500' : ''}
      />
    </FieldWrapper>
  );
};

// Number input field with units
export const ClinicalNumberField: React.FC<NumberFieldProps> = ({
  id,
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unit,
  description,
  clinicalNote,
  error,
  warning,
  required,
  className
}) => {
  return (
    <FieldWrapper
      id={id}
      label={label}
      description={description}
      clinicalNote={clinicalNote}
      error={error}
      warning={warning}
      required={required}
      className={className}
    >
      <div className="flex items-center">
        <Input
          type="number"
          id={id}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className={`${error ? 'border-red-500 focus:border-red-500' : ''} ${
            unit ? 'rounded-r-none' : ''
          }`}
        />
        {unit && (
          <div className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r-md text-sm text-gray-700">
            {unit}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
};

// Slider field with labels (for Stanford scales)
export const ClinicalSliderField: React.FC<SliderFieldProps> = ({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  labels,
  showValue = true,
  description,
  clinicalNote,
  error,
  warning,
  required,
  className
}) => {
  return (
    <FieldWrapper
      id={id}
      label={label}
      description={description}
      clinicalNote={clinicalNote}
      error={error}
      warning={warning}
      required={required}
      className={className}
    >
      <div className="space-y-3">
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${
            error ? 'accent-red-500' : 'accent-blue-600'
          }`}
        />
        
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{labels?.[min] || `${min}`}</span>
          {showValue && (
            <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
              {labels?.[value] || `${value}/${max}`}
            </span>
          )}
          <span>{labels?.[max] || `${max}`}</span>
        </div>
        
        {/* Show all scale labels for Stanford scales */}
        {labels && Object.keys(labels).length > 2 && (
          <div className="grid grid-cols-5 gap-1 text-xs text-gray-500 mt-2">
            {Object.entries(labels).map(([val, labelText]) => (
              <div key={val} className="text-center">
                <div className="font-medium">{val}</div>
                <div className="text-xs">{labelText}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
};

// Checkbox field
export const ClinicalCheckboxField: React.FC<CheckboxFieldProps> = ({
  id,
  label,
  checked,
  onChange,
  description,
  clinicalNote,
  error,
  warning,
  className
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-start space-x-3 cursor-pointer">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={`mt-1 rounded border-gray-300 ${
            error ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
          }`}
        />
        <div className="flex-1">
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium">{label}</span>
            {clinicalNote && (
              <div className="group relative">
                <HelpCircle className="w-4 h-4 text-blue-500 cursor-help" />
                <div className="absolute left-full ml-2 top-0 z-10 invisible group-hover:visible bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-800 whitespace-nowrap max-w-xs">
                  {clinicalNote}
                </div>
              </div>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </label>
      
      {error && (
        <div className="flex items-start space-x-2 text-sm text-red-600 ml-6">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {warning && !error && (
        <div className="flex items-start space-x-2 text-sm text-amber-600 ml-6">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{warning}</span>
        </div>
      )}
    </div>
  );
};

// Textarea field
export const ClinicalTextAreaField: React.FC<TextAreaFieldProps> = ({
  id,
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  maxLength,
  description,
  clinicalNote,
  error,
  warning,
  required,
  className
}) => {
  const remainingChars = maxLength ? maxLength - value.length : null;
  
  return (
    <FieldWrapper
      id={id}
      label={label}
      description={description}
      clinicalNote={clinicalNote}
      error={error}
      warning={warning}
      required={required}
      className={className}
    >
      <div className="space-y-1">
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          }`}
        />
        {maxLength && (
          <div className="text-xs text-muted-foreground text-right">
            {remainingChars} characters remaining
          </div>
        )}
      </div>
    </FieldWrapper>
  );
};

// Dual number field (for hours/minutes pairs)
interface DualNumberFieldProps extends BaseFieldProps {
  hours: number;
  minutes: number;
  onHoursChange: (hours: number) => void;
  onMinutesChange: (minutes: number) => void;
  maxHours?: number;
  hoursLabel?: string;
  minutesLabel?: string;
}

export const ClinicalDualNumberField: React.FC<DualNumberFieldProps> = ({
  id,
  label,
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
  maxHours = 23,
  hoursLabel = 'Hours',
  minutesLabel = 'Minutes',
  description,
  clinicalNote,
  error,
  warning,
  required,
  className
}) => {
  return (
    <FieldWrapper
      id={id}
      label={label}
      description={description}
      clinicalNote={clinicalNote}
      error={error}
      warning={warning}
      required={required}
      className={className}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${id}-hours`} className="text-sm">{hoursLabel}</Label>
          <Input
            type="number"
            id={`${id}-hours`}
            value={hours}
            onChange={(e) => onHoursChange(parseInt(e.target.value) || 0)}
            min={0}
            max={maxHours}
            className={error ? 'border-red-500 focus:border-red-500' : ''}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-minutes`} className="text-sm">{minutesLabel}</Label>
          <Input
            type="number"
            id={`${id}-minutes`}
            value={minutes}
            onChange={(e) => onMinutesChange(parseInt(e.target.value) || 0)}
            min={0}
            max={59}
            className={error ? 'border-red-500 focus:border-red-500' : ''}
          />
        </div>
      </div>
    </FieldWrapper>
  );
};

// Field group for related fields
interface FieldGroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const ClinicalFieldGroup: React.FC<FieldGroupProps> = ({
  title,
  description,
  children,
  icon,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-b border-gray-200 pb-2">
        <h4 className="font-medium text-gray-900 flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </h4>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

// Validation summary component
interface ValidationSummaryProps {
  errors: Array<{ field: string; message: string }>;
  warnings: Array<{ field: string; message: string; context?: string }>;
  className?: string;
}

export const ClinicalValidationSummary: React.FC<ValidationSummaryProps> = ({
  errors,
  warnings,
  className = ''
}) => {
  if (errors.length === 0 && warnings.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h5 className="font-medium text-red-800">Please fix the following errors:</h5>
          </div>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {errors.map((error, idx) => (
              <li key={idx}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-amber-600" />
            <h5 className="font-medium text-amber-800">Please review:</h5>
          </div>
          <ul className="list-disc list-inside text-sm text-amber-700 space-y-2">
            {warnings.map((warning, idx) => (
              <li key={idx}>
                {warning.message}
                {warning.context && (
                  <div className="text-xs mt-1 italic">{warning.context}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};