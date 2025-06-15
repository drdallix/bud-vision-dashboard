
import { Pause, Play, ArrowLeft, ArrowRight, Settings, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

interface ShowcaseControlsProps {
  total: number;
  current: number;
  paused: boolean;
  slideInterval: number;
  setPaused: (val: boolean) => void;
  setSlideInterval: (val: number) => void;
  onNav: (step: number) => void;
  onGoToSlide: (index: number) => void;
}

const ShowcaseControls = ({
  total, current, paused, slideInterval, setPaused, setSlideInterval, onNav, onGoToSlide,
}: ShowcaseControlsProps) => {
  const [showSettings, setShowSettings] = useState(false);

  const resetToStart = () => {
    onGoToSlide(0);
    setPaused(true);
  };

  const intervalInSeconds = slideInterval / 1000;

  return (
    <div className="bg-background border rounded-lg p-4 space-y-4">
      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Previous" 
          onClick={() => onNav(current === 0 ? total - 1 : current - 1)}
        >
          <ArrowLeft />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          aria-label={paused ? "Play" : "Pause"}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play /> : <Pause />}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Next" 
          onClick={() => onNav((current + 1) % total)}
        >
          <ArrowRight />
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Reset to start" 
          onClick={resetToStart}
        >
          <RotateCcw />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Settings"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings />
        </Button>
      </div>

      {/* Slide Navigation Dots */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {Array.from({ length: total }).map((_, i) => (
          <Button
            key={i}
            variant={i === current ? "default" : "outline"}
            size="sm"
            className={`w-8 h-8 rounded-full p-0 text-xs ${
              i === current ? 'bg-green-600 hover:bg-green-700' : ''
            }`}
            onClick={() => onGoToSlide(i)}
          >
            {i + 1}
          </Button>
        ))}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t pt-4 space-y-4">
          <div className="text-sm font-medium text-center">Showcase Settings</div>
          
          {/* Auto-play Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm">Auto-play</label>
            <Switch 
              checked={!paused} 
              onCheckedChange={(checked) => setPaused(!checked)} 
            />
          </div>

          {/* Interval Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm">Slide Duration</label>
              <span className="text-sm text-muted-foreground">{intervalInSeconds}s</span>
            </div>
            <Slider
              value={[intervalInSeconds]}
              onValueChange={([value]) => setSlideInterval(value * 1000)}
              min={3}
              max={20}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Current Slide Info */}
          <div className="text-center text-sm text-muted-foreground">
            Slide {current + 1} of {total}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowcaseControls;
