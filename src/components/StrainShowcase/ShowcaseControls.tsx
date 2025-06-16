
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Maximize, Settings } from 'lucide-react';
import { Strain } from '@/types/strain';
import CurrentStrainInfo from './CurrentStrainInfo';
import SlideNavigation from './SlideNavigation';
import SettingsPanel from './SettingsPanel';
import { TransitionMode } from './FullscreenTransitions';

interface ShowcaseControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onFullscreen: () => void;
  transitionMode: TransitionMode;
  onTransitionChange: (mode: TransitionMode) => void;
  disabled: boolean;
  total: number;
  current: number;
  onNav: (index: number) => void;
  currentStrain?: Strain;
}

const ShowcaseControls = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onFullscreen,
  transitionMode,
  onTransitionChange,
  disabled,
  total,
  current,
  onNav,
  currentStrain,
}: ShowcaseControlsProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [slideInterval, setSlideInterval] = useState(5000);

  const resetToStart = () => {
    onNav(0);
  };

  return (
    <Card className="border-green-200/50 bg-white/90 backdrop-blur-sm shadow-xl">
      <div className="p-4 md:p-6 space-y-4">
        {/* Current Strain Info */}
        {currentStrain && (
          <CurrentStrainInfo
            strain={currentStrain}
            current={current}
            total={total}
          />
        )}

        {/* Main Playback Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevious}
            disabled={disabled}
            className="h-10 w-10"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            variant={isPlaying ? "secondary" : "default"}
            size="icon"
            onClick={onPlayPause}
            disabled={disabled}
            className="h-12 w-12"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
            disabled={disabled}
            className="h-10 w-10"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <div className="h-8 w-px bg-border mx-2" />

          <Button
            variant="outline"
            size="icon"
            onClick={onFullscreen}
            disabled={disabled}
            className="h-10 w-10"
            title="Enter fullscreen mode"
          >
            <Maximize className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="h-10 w-10"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="text-center text-sm text-muted-foreground">
          {current + 1} of {total} strains
        </div>

        {/* Slide Navigation Dots */}
        <SlideNavigation
          total={total}
          current={current}
          onNav={onNav}
        />

        {/* Settings Panel */}
        {showSettings && (
          <SettingsPanel
            paused={!isPlaying}
            slideInterval={slideInterval}
            total={total}
            current={current}
            setPaused={(paused) => onPlayPause()}
            setSlideInterval={setSlideInterval}
          />
        )}
      </div>
    </Card>
  );
};

export default ShowcaseControls;
