
import { Pause, Play, ArrowLeft, ArrowRight, Settings, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { Strain } from '@/types/strain';

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

  const intervalInSeconds = slideInterval / 1000;

  return (
    <Card className="border-green-200/50 bg-white/90 backdrop-blur-sm shadow-xl">
      <div className="p-4 md:p-6 space-y-4">
        {/* Current Strain Info */}
        {currentStrain && (
          <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-gray-800">{currentStrain.name}</h4>
                <p className="text-sm text-gray-600">{currentStrain.type} • {currentStrain.thc}% THC</p>
              </div>
            </div>
            <Badge className="bg-green-600 text-white">
              {current + 1} of {total}
            </Badge>
          </div>
        )}

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button 
            variant="outline" 
            size="icon"
            className="hover:scale-110 transition-transform shadow-md"
            aria-label="Previous" 
            onClick={() => onNav(current === 0 ? total - 1 : current - 1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant={paused ? "default" : "secondary"}
            size="icon"
            className={`hover:scale-110 transition-all shadow-lg ${
              paused 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
            aria-label={paused ? "Play" : "Pause"}
            onClick={() => setPaused(!paused)}
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            className="hover:scale-110 transition-transform shadow-md"
            aria-label="Next" 
            onClick={() => onNav((current + 1) % total)}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="w-px h-8 bg-gray-300 mx-2"></div>

          <Button 
            variant="ghost" 
            size="icon"
            className="hover:scale-110 transition-transform"
            aria-label="Reset to start" 
            onClick={resetToStart}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hover:scale-110 transition-transform"
            aria-label="Settings"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className={`h-4 w-4 ${showSettings ? 'rotate-90' : ''} transition-transform`} />
          </Button>
        </div>

        {/* Slide Navigation Dots */}
        <div className="flex items-center justify-center gap-2 flex-wrap max-h-20 overflow-y-auto">
          {Array.from({ length: Math.min(total, 20) }).map((_, i) => (
            <Button
              key={i}
              variant={i === current ? "default" : "outline"}
              size="sm"
              className={`w-8 h-8 rounded-full p-0 text-xs transition-all duration-300 ${
                i === current 
                  ? 'bg-green-600 hover:bg-green-700 scale-110 shadow-lg' 
                  : 'hover:scale-105'
              }`}
              onClick={() => onNav(i)}
            >
              {i + 1}
            </Button>
          ))}
          {total > 20 && (
            <Badge variant="secondary" className="ml-2">
              +{total - 20} more
            </Badge>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-t border-gray-200 pt-4 space-y-4 animate-fade-in">
            <div className="text-sm font-medium text-center text-gray-700 flex items-center justify-center gap-2">
              <Settings className="h-4 w-4" />
              Showcase Settings
            </div>
            
            {/* Auto-play Toggle */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Auto-play</label>
                <p className="text-xs text-gray-500">Automatically advance slides</p>
              </div>
              <Switch 
                checked={!paused} 
                onCheckedChange={(checked) => setPaused(!checked)} 
              />
            </div>

            {/* Interval Slider */}
            <div className="space-y-3 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Slide Duration</label>
                  <p className="text-xs text-gray-500">Time between auto-advances</p>
                </div>
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  {intervalInSeconds}s
                </Badge>
              </div>
              <Slider
                value={[intervalInSeconds]}
                onValueChange={([value]) => setSlideInterval(value * 1000)}
                min={2}
                max={15}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>2s</span>
                <span>Fast ←→ Slow</span>
                <span>15s</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{total}</div>
                <div className="text-xs text-gray-500">Total Strains</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{current + 1}</div>
                <div className="text-xs text-gray-500">Current Slide</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ShowcaseControls;
