
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Settings, Shuffle, Palette } from 'lucide-react';
import { Strain } from '@/types/strain';
import { TransitionMode } from './FullscreenTransitions';
import AnimationSettings, { AnimationSettings as AnimationSettingsType } from './AnimationSettings';
import { saveAnimationSettings, loadAnimationSettings } from '@/services/animationSettingsService';

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
  const [animationSettings, setAnimationSettings] = useState<AnimationSettingsType>({
    transitionMode: 'elegant',
    slideInterval: 5000,
    textAnimationSpeed: 1000,
    particleIntensity: 50,
    glowIntensity: 50,
    autoTransition: true,
    shuffleTransitions: false,
    emojiAnimations: true,
    parallaxEffect: true,
    backgroundMotion: true
  });

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await loadAnimationSettings();
      setAnimationSettings(settings);
      setTransitionMode(settings.transitionMode);
      setSlideInterval(settings.slideInterval);
      setPaused(!settings.autoTransition);
      setShuffleTransitions(settings.shuffleTransitions);
    };
    loadSettings();
  }, []);

  // Save settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      await saveAnimationSettings(animationSettings);
    };
    saveSettings();
  }, [animationSettings]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const shouldShow = e.clientY > window.innerHeight - 200;
      
      if (shouldShow !== visible) {
        setVisible(shouldShow);
        
        if (hideTimeout) {
          clearTimeout(hideTimeout);
        }
        
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

  const handleSettingsChange = (newSettings: AnimationSettingsType) => {
    setAnimationSettings(newSettings);
    setTransitionMode(newSettings.transitionMode);
    setSlideInterval(newSettings.slideInterval);
    setPaused(!newSettings.autoTransition);
    setShuffleTransitions(newSettings.shuffleTransitions);
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
          <div className="flex items-center gap-4 relative">
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
              <Palette className="h-5 w-5" />
            </Button>

            {/* Animation Settings Panel */}
            {showSettings && (
              <AnimationSettings
                settings={animationSettings}
                onSettingsChange={handleSettingsChange}
                onClose={() => setShowSettings(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenControls;
