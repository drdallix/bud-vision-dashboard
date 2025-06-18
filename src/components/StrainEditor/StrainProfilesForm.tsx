
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Plus, X, Palette, Zap } from 'lucide-react';
import { Strain, EffectProfile, FlavorProfile } from '@/types/strain';
import { useToast } from '@/hooks/use-toast';

interface StrainProfilesFormProps {
  strain: Strain;
  onUpdate: (field: string, value: any) => void;
  isLoading: boolean;
}

const COMMON_EFFECTS = [
  { name: 'Relaxed', emoji: '😌', color: '#8B5CF6' },
  { name: 'Happy', emoji: '😊', color: '#F59E0B' },
  { name: 'Euphoric', emoji: '🤩', color: '#EF4444' },
  { name: 'Uplifted', emoji: '⬆️', color: '#10B981' },
  { name: 'Creative', emoji: '🎨', color: '#8B5CF6' },
  { name: 'Focused', emoji: '🎯', color: '#3B82F6' },
  { name: 'Sleepy', emoji: '😴', color: '#6B7280' },
  { name: 'Hungry', emoji: '🍽️', color: '#F59E0B' },
];

const COMMON_FLAVORS = [
  { name: 'Earthy', emoji: '🌍', color: '#78716C' },
  { name: 'Sweet', emoji: '🍯', color: '#F59E0B' },
  { name: 'Citrus', emoji: '🍋', color: '#EAB308' },
  { name: 'Pine', emoji: '🌲', color: '#059669' },
  { name: 'Berry', emoji: '🫐', color: '#7C3AED' },
  { name: 'Diesel', emoji: '⛽', color: '#374151' },
  { name: 'Skunk', emoji: '🦨', color: '#6B7280' },
  { name: 'Floral', emoji: '🌸', color: '#EC4899' },
];

const StrainProfilesForm = ({ strain, onUpdate, isLoading }: StrainProfilesFormProps) => {
  const [selectedEffect, setSelectedEffect] = useState('');
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const { toast } = useToast();

  const addEffect = (effectTemplate: typeof COMMON_EFFECTS[0]) => {
    const existingEffect = strain.effectProfiles?.find(e => e.name === effectTemplate.name);
    if (existingEffect) {
      toast({
        title: "Effect Already Added",
        description: `${effectTemplate.name} is already in the effects list.`,
        variant: "destructive",
      });
      return;
    }

    const newEffect: EffectProfile = {
      name: effectTemplate.name,
      intensity: 3,
      emoji: effectTemplate.emoji,
      color: effectTemplate.color,
    };

    const updatedEffects = [...(strain.effectProfiles || []), newEffect];
    onUpdate('effectProfiles', updatedEffects);
  };

  const removeEffect = (effectName: string) => {
    const updatedEffects = strain.effectProfiles?.filter(e => e.name !== effectName) || [];
    onUpdate('effectProfiles', updatedEffects);
  };

  const updateEffectIntensity = (effectName: string, intensity: number) => {
    const updatedEffects = strain.effectProfiles?.map(e => 
      e.name === effectName ? { ...e, intensity } : e
    ) || [];
    onUpdate('effectProfiles', updatedEffects);
  };

  const addFlavor = (flavorTemplate: typeof COMMON_FLAVORS[0]) => {
    const existingFlavor = strain.flavorProfiles?.find(f => f.name === flavorTemplate.name);
    if (existingFlavor) {
      toast({
        title: "Flavor Already Added",
        description: `${flavorTemplate.name} is already in the flavors list.`,
        variant: "destructive",
      });
      return;
    }

    const newFlavor: FlavorProfile = {
      name: flavorTemplate.name,
      intensity: 3,
      emoji: flavorTemplate.emoji,
      color: flavorTemplate.color,
    };

    const updatedFlavors = [...(strain.flavorProfiles || []), newFlavor];
    onUpdate('flavorProfiles', updatedFlavors);
  };

  const removeFlavor = (flavorName: string) => {
    const updatedFlavors = strain.flavorProfiles?.filter(f => f.name !== flavorName) || [];
    onUpdate('flavorProfiles', updatedFlavors);
  };

  const updateFlavorIntensity = (flavorName: string, intensity: number) => {
    const updatedFlavors = strain.flavorProfiles?.map(f => 
      f.name === flavorName ? { ...f, intensity } : f
    ) || [];
    onUpdate('flavorProfiles', updatedFlavors);
  };

  return (
    <div className="space-y-6">
      {/* Effects Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Effect Profiles</h3>
        </div>

        {/* Current Effects */}
        {strain.effectProfiles && strain.effectProfiles.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Current Effects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {strain.effectProfiles.map((effect) => (
                <div key={effect.name} className="flex items-center gap-4 p-3 border rounded-lg">
                  <Badge 
                    variant="outline" 
                    className="flex items-center gap-1"
                    style={{ borderColor: effect.color, color: effect.color }}
                  >
                    <span>{effect.emoji}</span>
                    {effect.name}
                  </Badge>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground">Intensity:</span>
                      <span className="text-sm font-medium">{effect.intensity}/5</span>
                    </div>
                    <Slider
                      value={[effect.intensity]}
                      onValueChange={([value]) => updateEffectIntensity(effect.name, value)}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEffect(effect.name)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Add Effects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Effects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COMMON_EFFECTS.map((effect) => (
                <Button
                  key={effect.name}
                  variant="outline"
                  size="sm"
                  onClick={() => addEffect(effect)}
                  disabled={isLoading || strain.effectProfiles?.some(e => e.name === effect.name)}
                  className="justify-start"
                >
                  <span className="mr-1">{effect.emoji}</span>
                  {effect.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flavors Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold">Flavor Profiles</h3>
        </div>

        {/* Current Flavors */}
        {strain.flavorProfiles && strain.flavorProfiles.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Current Flavors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {strain.flavorProfiles.map((flavor) => (
                <div key={flavor.name} className="flex items-center gap-4 p-3 border rounded-lg">
                  <Badge 
                    variant="outline" 
                    className="flex items-center gap-1"
                    style={{ borderColor: flavor.color, color: flavor.color }}
                  >
                    <span>{flavor.emoji}</span>
                    {flavor.name}
                  </Badge>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground">Intensity:</span>
                      <span className="text-sm font-medium">{flavor.intensity}/5</span>
                    </div>
                    <Slider
                      value={[flavor.intensity]}
                      onValueChange={([value]) => updateFlavorIntensity(flavor.name, value)}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFlavor(flavor.name)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Add Flavors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Flavors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COMMON_FLAVORS.map((flavor) => (
                <Button
                  key={flavor.name}
                  variant="outline"
                  size="sm"
                  onClick={() => addFlavor(flavor)}
                  disabled={isLoading || strain.flavorProfiles?.some(f => f.name === flavor.name)}
                  className="justify-start"
                >
                  <span className="mr-1">{flavor.emoji}</span>
                  {flavor.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StrainProfilesForm;
