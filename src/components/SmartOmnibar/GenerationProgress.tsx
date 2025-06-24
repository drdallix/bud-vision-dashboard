
import { Search, Database, Zap, CheckCircle } from 'lucide-react';
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

  const getStepIcon = () => {
    if (generationStep === 0) return <Search className="h-4 w-4 text-blue-500 animate-pulse" />;
    if (generationStep === 1) return <Database className="h-4 w-4 text-yellow-500 animate-pulse" />;
    if (generationStep === 2) return <Zap className="h-4 w-4 text-purple-500 animate-pulse" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getProgressColor = () => {
    if (progress < 30) return "bg-blue-500";
    if (progress < 60) return "bg-yellow-500";
    if (progress < 90) return "bg-purple-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            {getStepIcon()}
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              AI STRAIN ANALYSIS
            </span>
          </div>
          <div className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full border">
            {Math.round(progress)}%
          </div>
        </div>
        
        <Progress value={progress} className={`mb-3 h-2`} />
        
        <div className="text-sm text-slate-600 dark:text-slate-400 min-h-[20px] font-medium">
          {currentStepText}
          {currentStepText && <span className="animate-pulse text-blue-500 ml-1">▋</span>}
        </div>
        
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Real-time AI processing • No artificial delays
        </div>
      </div>
    </div>
  );
};

export default GenerationProgress;
