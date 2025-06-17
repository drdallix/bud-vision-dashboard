import { useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import VoiceInput from './VoiceInput';
import ImageUpload from './ImageUpload';
import GenerationProgress from './GenerationProgress';
import StatusRow from './StatusRow';
import InputControls from './InputControls';
import { useGenerationLogic } from './useGenerationLogic';
import { Strain } from '@/types/strain';

interface SmartOmnibarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onStrainGenerated: (strain: Strain) => void;
  hasResults: boolean;
}

const SmartOmnibar = ({ searchTerm, onSearchChange, onStrainGenerated, hasResults }: SmartOmnibarProps) => {
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const {
    isGenerating,
    generationStep,
    progress,
    currentStepText,
    generationSteps,
    handleGenerate,
    canGenerate
  } = useGenerationLogic({
    searchTerm,
    uploadedImage,
    onStrainGenerated,
    onSearchChange,
    setUploadedImage
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImage(imageUrl);
        setShowImageUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceResult = (transcript: string) => {
    onSearchChange(transcript);
  };

  const clearImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --- NEW: Keydown handler to trigger generation on "Enter" ---
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Check if the pressed key is "Enter" and if generation is allowed
    if (event.key === 'Enter' && canGenerate) {
      // Prevent the default action (e.g., form submission)
      event.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="space-y-2">
      {/* Main omnibar input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          placeholder="Search strains or describe what you're looking for..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown} // --- NEW: Added onKeyDown event listener ---
          disabled={isGenerating}
          className={`pl-10 pr-32 h-11 text-base border-2 transition-colors ${
            isGenerating ? 'border-green-500 bg-green-50/50' : 'focus:border-primary/50'
          }`}
        />
        
        <InputControls
          isGenerating={isGenerating}
          canGenerate={canGenerate}
          onVoiceClick={() => setShowVoiceInput(true)}
          onCameraClick={() => fileInputRef.current?.click()}
          onGenerate={handleGenerate}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <GenerationProgress
        isGenerating={isGenerating}
        generationStep={generationStep}
        progress={progress}
        currentStepText={currentStepText}
        generationSteps={generationSteps}
      />

      <StatusRow
        uploadedImage={uploadedImage}
        searchTerm={searchTerm}
        isGenerating={isGenerating}
        hasUser={!!user}
        onClearImage={clearImage}
      />

      <VoiceInput
        isOpen={showVoiceInput}
        onClose={() => setShowVoiceInput(false)}
        onResult={handleVoiceResult}
      />

      <ImageUpload
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onUpload={setUploadedImage}
      />
    </div>
  );
};

export default SmartOmnibar;