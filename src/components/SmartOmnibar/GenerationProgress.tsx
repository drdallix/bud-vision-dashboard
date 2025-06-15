
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface GenerationProgressProps {
  isGenerating: boolean;
  generationStep: number;
  progress: number;
  currentStepText: string;
  generationSteps: string[];
}

const GenerationProgress = ({
  isGenerating,
  generationStep,
  progress,
  currentStepText,
  generationSteps
}: GenerationProgressProps) => {
  if (!isGenerating) return null;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-green-600 animate-spin" />
            <span className="text-sm font-medium text-green-800">AI Generating Strain</span>
          </div>
          <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
            Step {generationStep + 1} of {generationSteps.length}
          </div>
        </div>
        
        <Progress value={progress} className="mb-3 h-2" />
        
        <div className="text-sm text-green-700 min-h-[20px] font-mono">
          {currentStepText}
          <span className="animate-pulse">|</span>
        </div>
      </div>
    </div>
  );
};

export default GenerationProgress;
