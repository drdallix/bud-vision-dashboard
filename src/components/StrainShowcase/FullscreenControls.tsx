
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, SkipBack, SkipForward, Settings, Shuffle } from 'lucide-react';
import { Strain } from '@/types/strain';
import { TransitionMode, TRANSITION_MODES } from './FullscreenTransitions';

export interface FullscreenControlsProps {
  total: number;
  current: number;
  paused: boolean;
  slideInterval: number;
  setPaused: (paused: boolean) => void;
  setSlideInterval: (interval: number) => void;
  onNav: (index: number) => void;
  currentStrain: Strain;
  transitionMode?: TransitionMode;
  setTransitionMode?: (mode: TransitionMode) => void;
  shuffleTransitions?: boolean;
  setShuffleTransitions?: (shuffle: boolean) => void;
  shuffleMode?: boolean;
  setShuffleMode?: (shuffle: boolean) => void;
}

const FullscreenControls = ({
  total,
  current,
  paused,
  slideInterval,
  setPaused,
  setSlideInterval,
  onNav,
  currentStrain,
  transitionMode = 'elegant',
  setTransitionMode = () => {},
  shuffleTransitions = false,
  setShuffleTransitions = () => {},
  shuffleMode = false,
  setShuffleMode = () => {}
}: FullscreenControlsProps) => {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const shouldShow = e.clientY > window.innerHeight - 200; // Show when near bottom 200px
      
      if (shouldShow !== visible) {
        setVisible(shouldShow);
        
        // Clear existing timeout
        if (hideTimeout) {
          clearTimeout(hideTimeout);
        }
        
        // Set new timeout to hide after 3 seconds of inactivity
        if (shouldShow) {
          const timeout = setTimeout(() => {
            setVisible(false);
          }, 3000);
          setHideTimeout(timeout);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [visible, hideTimeout]);

  const handlePrevious = () => {
    onNav(current > 0 ? current - 1 : total - 1);
  };

  const handleNext = () => {
    onNav(current < total - 1 ? current + 1 : 0);
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm" />
      
      {/* Controls */}
      <div className="relative p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Left: Navigation */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={handlePrevious}
              className="text-white hover:bg-white/20 transition-all duration-300"
            >
              <SkipBack className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setPaused(!paused)}
              className="text-white hover:bg-white/20 transition-all duration-300"
            >
              {paused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={handleNext}
              className="text-white hover:bg-white/20 transition-all duration-300"
            >
              <SkipForward className="h-6 w-6" />
            </Button>
          </div>

          {/* Center: Progress and Info */}
          <div className="flex-1 mx-8">
            <div className="text-center mb-2">
              <h3 className="text-white text-lg font-semibold truncate">
                {currentStrain.name}
              </h3>
              <p className="text-white/70 text-sm">
                {current + 1} of {total} • {currentStrain.type}
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-1">
              <div 
                className="bg-white rounded-full h-1 transition-all duration-300"
                style={{ width: `${((current + 1) / total) * 100}%` }}
              />
            </div>
          </div>

          {/* Right: Settings */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShuffleMode(!shuffleMode)}
              className={`text-white hover:bg-white/20 transition-all duration-300 ${
                shuffleMode ? 'bg-white/20' : ''
              }`}
            >
              <Shuffle className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:bg-white/20 transition-all duration-300"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute bottom-full right-6 mb-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-[300px]">
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Transition Mode
                </label>
                <Select value={transitionMode} onValueChange={setTransitionMode}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    {Object.entries(TRANSITION_MODES).map(([key, config]) => (
                      <SelectItem key={key} value={key} className="text-white hover:bg-white/10">
                        <div>
                          <div className="font-medium">{config.name}</div>
                          <div className="text-sm text-white/70">{config.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Slide Interval (seconds)
                </label>
                <Select value={slideInterval.toString()} onValueChange={(value) => setSlideInterval(Number(value))}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    <SelectItem value="3000" className="text-white hover:bg-white/10">3 seconds</SelectItem>
                    <SelectItem value="5000" className="text-white hover:bg-white/10">5 seconds</SelectItem>
                    <SelectItem value="8000" className="text-white hover:bg-white/10">8 seconds</SelectItem>
                    <SelectItem value="10000" className="text-white hover:bg-white/10">10 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullscreenControls;
