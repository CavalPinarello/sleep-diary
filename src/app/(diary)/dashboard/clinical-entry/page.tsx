import { Metadata } from 'next';
import { ClinicalEntryWizard } from '@/components/diary/clinical-entry-wizard';

export const metadata: Metadata = {
  title: 'Clinical Sleep Entry | Sleep Diary',
  description: 'Stanford Sleep Health Program compliant sleep diary entry',
};

export default function ClinicalEntryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Stanford Clinical Sleep Diary
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Complete your comprehensive sleep assessment using the Stanford Sleep Health Program methodology.
          This multi-step form captures all clinical parameters needed for professional sleep evaluation.
        </p>
      </div>
      
      <ClinicalEntryWizard />
    </div>
  );
}