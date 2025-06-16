
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Strain } from '@/types/strain';
import CurrentStrainInfo from './CurrentStrainInfo';
import PlaybackControls from './PlaybackControls';
import SlideNavigation from './SlideNavigation';
import SettingsPanel from './SettingsPanel';

interface ShowcaseControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onFullscreen: () => void;
  transitionMode: 'fade' | 'slide';
  onTransitionChange: (mode: 'fade' | 'slide') => void;
  disabled: boolean;
  total?: number;
  current?: number;
  onNav?: (index: number) => void;
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
  total = 0,
  current = 0,
  onNav = () => {},
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

        {/* Main Controls */}
        <PlaybackControls
          current={current}
          total={total}
          paused={!isPlaying}
          showSettings={showSettings}
          setPaused={(paused) => onPlayPause()}
          onNav={onNav}
          onReset={resetToStart}
          onToggleSettings={() => setShowSettings(!showSettings)}
        />

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
