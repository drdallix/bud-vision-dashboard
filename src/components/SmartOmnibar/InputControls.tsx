
import { Button } from '@/components/ui/button';
import { Mic, Camera, Sparkles } from 'lucide-react';

interface InputControlsProps {
  isGenerating: boolean;
  canGenerate: boolean;
  onVoiceClick: () => void;
  onCameraClick: () => void;
  onGenerate: () => void;
}

const InputControls = ({ 
  isGenerating, 
  canGenerate, 
  onVoiceClick, 
  onCameraClick, 
  onGenerate 
}: InputControlsProps) => {
  return (
    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onVoiceClick}
        disabled={isGenerating}
        className="h-7 w-7 p-0 hover:bg-muted"
      >
        <Mic className="h-3.5 w-3.5" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onCameraClick}
        disabled={isGenerating}
        className="h-7 w-7 p-0 hover:bg-muted"
      >
        <Camera className="h-3.5 w-3.5" />
      </Button>

      <Button
        onClick={onGenerate}
        disabled={!canGenerate}
        size="sm"
        className={`h-7 px-2 text-white text-xs transition-all ${
          isGenerating 
            ? 'bg-green-600 animate-pulse' 
            : 'cannabis-gradient hover:scale-105'
        }`}
      >
        <Sparkles className={`h-3 w-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
        {isGenerating ? 'AI' : 'AI'}
      </Button>
    </div>
  );
};

export default InputControls;
