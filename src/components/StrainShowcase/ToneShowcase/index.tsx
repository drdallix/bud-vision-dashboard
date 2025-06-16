
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';
import { Strain } from '@/types/strain';
import { ToneSelector } from './ToneSelector';
import { ToneDescriptionDisplay } from './ToneDescriptionDisplay';
import { ToneActions } from './ToneActions';
import { ToneQuickPreview } from './ToneQuickPreview';
import { ToneGenerationStatus } from './ToneGenerationStatus';
import { useSafeToneLogic } from './useSafeToneLogic';
import ToneErrorBoundary from '@/components/ErrorBoundaries/ToneErrorBoundary';

interface ToneShowcaseProps {
  strain: Strain;
  onDescriptionChange: (description: string) => void;
}

export const ToneShowcase = ({ strain, onDescriptionChange }: ToneShowcaseProps) => {
  return (
    <ToneErrorBoundary strainName={strain.name}>
      <ToneShowcaseInner strain={strain} onDescriptionChange={onDescriptionChange} />
    </ToneErrorBoundary>
  );
};

const ToneShowcaseInner = ({ strain, onDescriptionChange }: ToneShowcaseProps) => {
  const {
    availableTones,
    selectedToneId,
    storedDescriptions,
    isGenerating,
    isApplyingGlobally,
    globalProgress,
    currentDescription,
    isLoading,
    error,
    switchToTone,
    generateDescriptionForTone,
    applyToneToAllStrains,
    getCurrentToneName,
    hasStoredDescription
  } = useSafeToneLogic(strain, onDescriptionChange);

  // Show loading state while tone system initializes
  if (isLoading) {
    return (
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-600" />
            Tone Control Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Initializing tone system...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state if tone system failed to initialize
  if (error) {
    return (
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50/50 to-red-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5 text-orange-600" />
            Tone Control Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Tone system temporarily unavailable. Using default description.
            </p>
            <div className="p-4 bg-white rounded-lg border">
              <p className="text-sm">{currentDescription}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
