
import { Pause, Play, ArrowLeft, ArrowRight, Settings, Minimize, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Strain } from '@/types/strain';
import { TransitionMode, TRANSITION_MODES } from './FullscreenTransitions';

interface FullscreenControlsProps {
  total: number;
  current: number;
  paused: boolean;
  transitionMode: TransitionMode;
  slideInterval: number;
  setPaused: (val: boolean) => void;
  setTransitionMode: (mode: TransitionMode) => void;
  setSlideInterval: (val: number) => void;
  onNav: (index: number) => void;
  currentStrain?: Strain;
}

const FullscreenControls = ({
  total, current, paused, transitionMode, slideInterval, setPaused, 
  setTransitionMode, setSlideInterval, onNav, currentStrain
}: FullscreenControlsProps) => {
  
  const exitFullscreen = async () => {
    try {
      await document.exitFullscreen();
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
    }
  };

  return (
    <Card className="bg-black/50 backdrop-blur-xl border-white/20 shadow-2xl">
      <div className="p-6 space-y-6">
        {/* Current Strain Info */}
        {currentStrain && (
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-white">{currentStrain.name}</h3>
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-purple-500/80 text-white">
                {currentStrain.type}
              </Badge>
              <span className="text-white/80">
                {current + 1} of {total}
              </span>
            </div>
          </div>
        )}

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => onNav(current === 0 ? total - 1 : current - 1)}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Button 
            variant={paused ? "default" : "secondary"} 
            size="lg" 
            onClick={() => setPaused(!paused)}
            className="px-8"
          >
            {paused ? <Play className="h-5 w-5 mr-2" /> : <Pause className="h-5 w-5 mr-2" />}
            {paused ? 'Play' : 'Pause'}
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => onNav((current + 1) % total)}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Transition Mode Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-white">
            <span className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Visual Mode
            </span>
          </div>
          <Select value={transitionMode} onValueChange={(value: TransitionMode) => setTransitionMode(value)}>
            <SelectTrigger className="bg-white/10 border-white/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TRANSITION_MODES).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex flex-col">
                    <span className="font-medium">{config.name}</span>
                    <span className="text-xs text-muted-foreground">{config.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Speed Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-white">
            <span>Slide Speed</span>
            <span>{slideInterval / 1000}s</span>
          </div>
          <Slider
            value={[slideInterval]}
            onValueChange={(value) => setSlideInterval(value[0])}
            max={10000}
            min={2000}
            step={1000}
            className="w-full"
          />
        </div>

        {/* Advanced Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={exitFullscreen}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <Minimize className="h-5 w-5 mr-2" />
            Exit
          </Button>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 flex-wrap">
          {Array.from({ length: total }).map((_, index) => (
            <button
              key={index}
              onClick={() => onNav(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === current 
                  ? 'bg-white scale-150' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default FullscreenControls;
