import { Metadata } from 'next';
import { ProgramEnrollmentWizard } from '@/components/program/program-enrollment-wizard';

export const metadata: Metadata = {
  title: 'Enroll in Stanford Sleep Program | Sleep Diary',
  description: 'Join the 14-day Stanford Sleep Health Program for comprehensive clinical assessment',
};

export default function ProgramEnrollmentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProgramEnrollmentWizard />
    </div>
  );
}