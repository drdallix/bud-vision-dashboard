
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Palette, Zap, Timer, Sparkles, Eye } from 'lucide-react';
import { TransitionMode, TRANSITION_MODES } from './FullscreenTransitions';

export interface AnimationSettings {
  transitionMode: TransitionMode;
  slideInterval: number;
  textAnimationSpeed: number;
  particleIntensity: number;
  glowIntensity: number;
  autoTransition: boolean;
  shuffleTransitions: boolean;
  emojiAnimations: boolean;
  parallaxEffect: boolean;
  backgroundMotion: boolean;
}

interface AnimationSettingsProps {
  settings: AnimationSettings;
  onSettingsChange: (settings: AnimationSettings) => void;
  onClose: () => void;
}

const AnimationSettings = ({ settings, onSettingsChange, onClose }: AnimationSettingsProps) => {
  const [activeTab, setActiveTab] = useState<'general' | 'effects' | 'timing'>('general');

  const updateSetting = <K extends keyof AnimationSettings>(
    key: K,
    value: AnimationSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="absolute bottom-full right-0 mb-4 bg-black/95 backdrop-blur-lg rounded-xl p-6 min-w-[400px] max-w-[500px] border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-white" />
          <h3 className="text-white font-semibold text-lg">Animation Studio</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          ✕
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'general', label: 'General', icon: Palette },
          { id: 'effects', label: 'Effects', icon: Sparkles },
          { id: 'timing', label: 'Timing', icon: Timer }
        ].map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 ${
              activeTab === id 
                ? 'bg-white text-black' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'general' && (
          <>
            {/* Transition Mode */}
            <div className="space-y-3">
              <label className="text-white text-sm font-medium">Transition Style</label>
              <Select value={settings.transitionMode} onValueChange={(value: TransitionMode) => updateSetting('transitionMode', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  {Object.entries(TRANSITION_MODES).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs border-white/30 text-white/70">
                          {config.name}
                        </Badge>
                        <span className="text-sm">{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Auto Transition */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white text-sm font-medium">Auto Transition</label>
                <p className="text-white/60 text-xs">Automatically advance slides</p>
              </div>
              <Switch 
                checked={settings.autoTransition} 
                onCheckedChange={(checked) => updateSetting('autoTransition', checked)} 
              />
            </div>

            {/* Shuffle Transitions */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white text-sm font-medium">Shuffle Transitions</label>
                <p className="text-white/60 text-xs">Random transition modes</p>
              </div>
              <Switch 
                checked={settings.shuffleTransitions} 
                onCheckedChange={(checked) => updateSetting('shuffleTransitions', checked)} 
              />
            </div>
          </>
        )}

        {activeTab === 'effects' && (
          <>
            {/* Particle Intensity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white text-sm font-medium">Particle Intensity</label>
                <Badge variant="outline" className="text-white/70 border-white/30">
                  {settings.particleIntensity}%
                </Badge>
              </div>
              <Slider
                value={[settings.particleIntensity]}
                onValueChange={([value]) => updateSetting('particleIntensity', value)}
                min={0}
                max={100}
                step={10}
                className="w-full"
              />
            </div>

            {/* Glow Intensity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white text-sm font-medium">Glow Intensity</label>
                <Badge variant="outline" className="text-white/70 border-white/30">
                  {settings.glowIntensity}%
                </Badge>
              </div>
              <Slider
                value={[settings.glowIntensity]}
                onValueChange={([value]) => updateSetting('glowIntensity', value)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Emoji Animations */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white text-sm font-medium">Emoji Animations</label>
                <p className="text-white/60 text-xs">Floating emoji effects</p>
              </div>
              <Switch 
                checked={settings.emojiAnimations} 
                onCheckedChange={(checked) => updateSetting('emojiAnimations', checked)} 
              />
            </div>

            {/* Parallax Effect */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white text-sm font-medium">Parallax Effect</label>
                <p className="text-white/60 text-xs">3D depth illusion</p>
              </div>
              <Switch 
                checked={settings.parallaxEffect} 
                onCheckedChange={(checked) => updateSetting('parallaxEffect', checked)} 
              />
            </div>

            {/* Background Motion */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white text-sm font-medium">Background Motion</label>
                <p className="text-white/60 text-xs">Animated background gradients</p>
              </div>
              <Switch 
                checked={settings.backgroundMotion} 
                onCheckedChange={(checked) => updateSetting('backgroundMotion', checked)} 
              />
            </div>
          </>
        )}

        {activeTab === 'timing' && (
          <>
            {/* Slide Interval */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white text-sm font-medium">Slide Duration</label>
                <Badge variant="outline" className="text-white/70 border-white/30">
                  {settings.slideInterval / 1000}s
                </Badge>
              </div>
              <Select value={settings.slideInterval.toString()} onValueChange={(value) => updateSetting('slideInterval', Number(value))}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  <SelectItem value="2000" className="text-white hover:bg-white/10">2 seconds</SelectItem>
                  <SelectItem value="3000" className="text-white hover:bg-white/10">3 seconds</SelectItem>
                  <SelectItem value="5000" className="text-white hover:bg-white/10">5 seconds</SelectItem>
                  <SelectItem value="8000" className="text-white hover:bg-white/10">8 seconds</SelectItem>
                  <SelectItem value="10000" className="text-white hover:bg-white/10">10 seconds</SelectItem>
                  <SelectItem value="15000" className="text-white hover:bg-white/10">15 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Text Animation Speed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white text-sm font-medium">Text Animation Speed</label>
                <Badge variant="outline" className="text-white/70 border-white/30">
                  {settings.textAnimationSpeed}ms
                </Badge>
              </div>
              <Slider
                value={[settings.textAnimationSpeed]}
                onValueChange={([value]) => updateSetting('textAnimationSpeed', value)}
                min={200}
                max={2000}
                step={100}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>

      {/* Quick Presets */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <label className="text-white text-sm font-medium mb-3 block">Quick Presets</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Minimal', settings: { transitionMode: 'minimal' as TransitionMode, particleIntensity: 20, glowIntensity: 10 } },
            { name: 'Cinematic', settings: { transitionMode: 'cinematic' as TransitionMode, particleIntensity: 60, glowIntensity: 50 } },
            { name: 'Psychedelic', settings: { transitionMode: 'psychedelic' as TransitionMode, particleIntensity: 90, glowIntensity: 80 } },
            { name: 'Zen Garden', settings: { transitionMode: 'zen' as TransitionMode, particleIntensity: 40, glowIntensity: 25 } }
          ].map(({ name, settings: presetSettings }) => (
            <Button
              key={name}
              variant="outline"
              size="sm"
              onClick={() => onSettingsChange({ ...settings, ...presetSettings })}
              className="text-white/70 border-white/20 hover:bg-white/10 hover:text-white text-xs"
            >
              {name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimationSettings;
