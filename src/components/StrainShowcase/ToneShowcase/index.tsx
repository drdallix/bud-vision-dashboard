
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';
import { Strain } from '@/types/strain';
import { ToneSelector } from './ToneSelector';
import { ToneDescriptionDisplay } from './ToneDescriptionDisplay';
import { ToneActions } from './ToneActions';
import { ToneQuickPreview } from './ToneQuickPreview';
import { ToneGenerationStatus } from './ToneGenerationStatus';
import { useToneLogic } from './useToneLogic';

interface ToneShowcaseProps {
  strain: Strain;
  onDescriptionChange: (description: string) => void;
}

export const ToneShowcase = ({ strain, onDescriptionChange }: ToneShowcaseProps) => {
  const {
    availableTones,
    selectedToneId,
    storedDescriptions,
    isGenerating,
    isApplyingGlobally,
    globalProgress,
    currentDescription,
    switchToTone,
    generateDescriptionForTone,
    applyToneToAllStrains,
    getCurrentToneName,
    hasStoredDescription
  } = useToneLogic(strain, onDescriptionChange);

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-600" />
          Tone Control Center
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Switch tones to instantly preview different writing styles. Changes appear in the showcase above automatically.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tone Selection */}
        <ToneSelector
          availableTones={availableTones}
          selectedToneId={selectedToneId}
          storedDescriptions={storedDescriptions}
          onToneChange={switchToTone}
        />

        {/* Live Preview */}
        <ToneDescriptionDisplay
          currentDescription={currentDescription}
          toneName={getCurrentToneName()}
          hasStoredDescription={hasStoredDescription(selectedToneId)}
          isGenerating={isGenerating}
        />

        {/* Action Buttons */}
        <ToneActions
          selectedToneId={selectedToneId}
          toneName={getCurrentToneName()}
          hasStoredDescription={hasStoredDescription(selectedToneId)}
          isGenerating={isGenerating}
          isApplyingGlobally={isApplyingGlobally}
          onGenerate={() => generateDescriptionForTone(selectedToneId)}
          onApplyGlobally={applyToneToAllStrains}
        />

        {/* Generation Status */}
        <ToneGenerationStatus
          isGenerating={isGenerating}
          isApplyingGlobally={isApplyingGlobally}
          globalProgress={globalProgress}
          toneName={getCurrentToneName()}
        />

        {/* Quick Tone Preview Grid */}
        <ToneQuickPreview
          availableTones={availableTones}
          selectedToneId={selectedToneId}
          storedDescriptions={storedDescriptions}
          onToneSwitch={switchToTone}
        />
      </CardContent>
    </Card>
  );
};
