
import { Search, Database, Zap, CheckCircle, Eye, Brain } from 'lucide-react';
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
    if (generationStep === 1) return <Brain className="h-4 w-4 text-purple-500 animate-pulse" />;
    if (generationStep === 2) return <Eye className="h-4 w-4 text-green-500 animate-pulse" />;
    if (generationStep === 3) return <Database className="h-4 w-4 text-yellow-500 animate-pulse" />;
    if (generationStep === 4) return <Zap className="h-4 w-4 text-orange-500 animate-pulse" />;
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
      <div className="relative bg-gradient-to-br from-black/70 to-black/50 border border-white/20 rounded-lg p-4 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            {getStepIcon()}
            <div className="absolute -inset-4 border-2 border-white/20 rounded-full animate-ping"></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              DoobieDB AI Analysis Active
            </span>
            <div className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full border border-white/20">
              {Math.round(progress)}%
            </div>
          </div>
        </div>
        
        <Progress value={progress} className="mb-3 h-2 bg-white/20" />
        
        <div className="text-sm text-white/90 min-h-[20px] font-medium">
          {currentStepText}
          {currentStepText && <span className="animate-pulse text-green-400 ml-1">▋</span>}
        </div>
        
        {progress > 0 && (
          <div className="flex justify-between text-xs text-white/60 mt-2">
            <span>Step {generationStep + 1} of {generationSteps.length}</span>
            <span>Professional cannabis AI analysis</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerationProgress;
