
import { Pause, Play, ArrowLeft, ArrowRight, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlaybackControlsProps {
  current: number;
  total: number;
  paused: boolean;
  showSettings: boolean;
  setPaused: (val: boolean) => void;
  onNav: (index: number) => void;
  onReset: () => void;
  onToggleSettings: () => void;
}

const PlaybackControls = ({
  current,
  total,
  paused,
  showSettings,
  setPaused,
  onNav,
  onReset,
  onToggleSettings,
}: PlaybackControlsProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button 
        variant="outline" 
        size="icon"
        aria-label="Previous" 
        onClick={() => onNav(current === 0 ? total - 1 : current - 1)}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant={paused ? "default" : "secondary"}
        size="icon"
        aria-label={paused ? "Play" : "Pause"}
        onClick={() => setPaused(!paused)}
      >
        {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
      </Button>
      
      <Button 
        variant="outline" 
        size="icon"
        aria-label="Next" 
        onClick={() => onNav((current + 1) % total)}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>

      <Button 
        variant="ghost" 
        size="icon"
        aria-label="Reset to start" 
        onClick={onReset}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Settings"
        onClick={onToggleSettings}
      >
        <Settings className={`h-4 w-4 ${showSettings ? 'rotate-90' : ''} transition-transform`} />
      </Button>
    </div>
  );
};

export default PlaybackControls;
