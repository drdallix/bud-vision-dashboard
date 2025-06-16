
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

  // Tap anywhere to toggle controls visibility
  useEffect(() => {
    const handleScreenTap = (e: MouseEvent | TouchEvent) => {
      // Don't toggle if clicking on controls themselves
      const target = e.target as HTMLElement;
      if (target.closest('[data-fullscreen-controls]')) {
        return;
      }
      
      setVisible(!visible);
    };

    window.addEventListener('click', handleScreenTap);
    window.addEventListener('touchend', handleScreenTap);
    
    return () => {
      window.removeEventListener('click', handleScreenTap);
      window.removeEventListener('touchend', handleScreenTap);
    };
  }, [visible]);

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

  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div 
      data-fullscreen-controls
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent backdrop-blur-sm" />
      
      {/* Tap hint when controls are hidden */}
      {!visible && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm pointer-events-none">
          Tap to show controls
        </div>
      )}
      
      {/* Controls */}
      <div className="relative p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Left: Navigation */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={handlePrevious}
              className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
            >
              <SkipBack className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setPaused(!paused)}
              className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
            >
              {paused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={handleNext}
              className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
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
                className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full h-1 transition-all duration-500 ease-in-out"
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
              className={`text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 ${
                shuffleMode ? 'bg-white/20 shadow-lg' : ''
              }`}
            >
              <Shuffle className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={handleSettingsToggle}
              className={`text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 ${
                showSettings ? 'bg-white/20 shadow-lg' : ''
              }`}
            >
              <Palette className="h-5 w-5" />
            </Button>

            {/* Animation Settings Panel */}
            {showSettings && (
              <div>
                <AnimationSettings
                  settings={animationSettings}
                  onSettingsChange={handleSettingsChange}
                  onClose={() => setShowSettings(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenControls;
