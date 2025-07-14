import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Database, 
  Dna, 
  Brain, 
  Microscope, 
  Zap, 
  Sparkles, 
  CheckCircle2,
  Wifi,
  Globe,
  FlaskConical,
  Atom
} from 'lucide-react';

interface DoobieSequenceProps {
  isActive: boolean;
  onComplete?: () => void;
  className?: string;
}

const sequences = [
  { 
    icon: Wifi, 
    text: "🔍 Connecting to DoobieDB Global Network...", 
    duration: 1200, 
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  { 
    icon: Search, 
    text: "🌐 Scanning web databases & strain registries...", 
    duration: 1400, 
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10"
  },
  { 
    icon: Globe, 
    text: "📊 Cross-referencing 847,392 strain profiles...", 
    duration: 1100, 
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10"
  },
  { 
    icon: Dna, 
    text: "🧬 Analyzing genetic markers & lineage...", 
    duration: 1300, 
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
  { 
    icon: Microscope, 
    text: "🔬 Processing cannabinoid spectrum data...", 
    duration: 1000, 
    color: "text-orange-500",
    bgColor: "bg-orange-500/10"
  },
  { 
    icon: FlaskConical, 
    text: "⚗️ Computing terpene interaction matrices...", 
    duration: 1200, 
    color: "text-pink-500",
    bgColor: "bg-pink-500/10"
  },
  { 
    icon: Atom, 
    text: "⚛️ Modeling molecular effect pathways...", 
    duration: 1100, 
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10"
  },
  { 
    icon: Brain, 
    text: "🧠 AI neural synthesis in progress...", 
    duration: 1300, 
    color: "text-violet-500",
    bgColor: "bg-violet-500/10"
  },
  { 
    icon: Zap, 
    text: "⚡ Generating comprehensive strain profile...", 
    duration: 1000, 
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10"
  },
  { 
    icon: CheckCircle2, 
    text: "✨ DoobieDB analysis complete!", 
    duration: 800, 
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  }
];

const DoobieSequence = ({ isActive, onComplete, className }: DoobieSequenceProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0);
      setProgress(0);
      setIsCompleted(false);
      return;
    }

    const executeSequence = async () => {
      for (let i = 0; i < sequences.length; i++) {
        setCurrentStep(i);
        setProgress(((i + 1) / sequences.length) * 100);
        
        await new Promise(resolve => setTimeout(resolve, sequences[i].duration));
      }
      
      setIsCompleted(true);
      setTimeout(() => {
        onComplete?.();
      }, 500);
    };

    executeSequence();
  }, [isActive, onComplete]);

  if (!isActive) return null;

  const currentSequence = sequences[currentStep];
  const Icon = currentSequence?.icon || Sparkles;

  return (
    <Card className={`p-6 w-full max-w-md mx-auto animate-fade-in ${className}`}>
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            DoobieDB AI Analysis
          </div>
          <div className="text-sm text-muted-foreground">
            Advanced cannabis genome analysis in progress...
          </div>
        </div>

        <div className="space-y-4">
          <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${currentSequence?.bgColor || 'bg-gray-500/10'}`}>
            <div className="relative">
              <Icon className={`h-6 w-6 ${currentSequence?.color || 'text-gray-500'} animate-pulse`} />
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-20 animate-ping"></div>
            </div>
            <div className="flex-1">
              <div className={`text-sm font-medium ${currentSequence?.color || 'text-gray-500'} transition-all duration-300`}>
                {currentSequence?.text || 'Processing...'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Analysis Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 transition-all duration-300" />
          </div>

          <div className="flex flex-wrap gap-1">
            {sequences.map((seq, index) => (
              <Badge 
                key={index}
                variant={index <= currentStep ? "default" : "outline"}
                className={`text-xs transition-all duration-300 ${
                  index === currentStep ? 'animate-pulse' : ''
                } ${
                  index < currentStep ? 'opacity-70' : ''
                }`}
              >
                {index < currentStep ? '✓' : index === currentStep ? '◐' : '○'}
              </Badge>
            ))}
          </div>
        </div>

        {isCompleted && (
          <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20 animate-fade-in">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2 animate-bounce" />
            <div className="text-green-700 font-medium">Analysis Complete!</div>
            <div className="text-xs text-green-600">Strain profile generated successfully</div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DoobieSequence;