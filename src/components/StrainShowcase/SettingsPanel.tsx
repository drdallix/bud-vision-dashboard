
import { Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface SettingsPanelProps {
  paused: boolean;
  slideInterval: number;
  total: number;
  current: number;
  setPaused: (val: boolean) => void;
  setSlideInterval: (val: number) => void;
}

const SettingsPanel = ({
  paused,
  slideInterval,
  total,
  current,
  setPaused,
  setSlideInterval,
}: SettingsPanelProps) => {
  const intervalInSeconds = slideInterval / 1000;

  return (
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
  );
};

export default SettingsPanel;
