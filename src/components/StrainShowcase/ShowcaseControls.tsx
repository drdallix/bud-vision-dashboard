
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Strain } from '@/types/strain';
import CurrentStrainInfo from './CurrentStrainInfo';
import PlaybackControls from './PlaybackControls';
import SlideNavigation from './SlideNavigation';
import SettingsPanel from './SettingsPanel';

interface ShowcaseControlsProps {
  total: number;
  current: number;
  paused: boolean;
  slideInterval: number;
  setPaused: (val: boolean) => void;
  setSlideInterval: (val: number) => void;
  onNav: (index: number) => void;
  currentStrain?: Strain;
}

const ShowcaseControls = ({
  total, current, paused, slideInterval, setPaused, setSlideInterval, onNav, currentStrain,
}: ShowcaseControlsProps) => {
  const [showSettings, setShowSettings] = useState(false);

  const resetToStart = () => {
    onNav(0);
    setPaused(true);
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
          paused={paused}
          showSettings={showSettings}
          setPaused={setPaused}
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
            paused={paused}
            slideInterval={slideInterval}
            total={total}
            current={current}
            setPaused={setPaused}
            setSlideInterval={setSlideInterval}
          />
        )}
      </div>
    </Card>
  );
};

export default ShowcaseControls;
