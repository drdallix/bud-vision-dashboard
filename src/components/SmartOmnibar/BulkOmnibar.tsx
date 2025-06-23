
import { useState, useRef } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import VoiceInput from './VoiceInput';
import ImageUpload from './ImageUpload';
import StatusRow from './StatusRow';
import InputControls from './InputControls';
import { useBulkGenerationLogic } from './useBulkGenerationLogic';
import { ExtractedStrain } from '@/services/bulkStrainService';

interface BulkOmnibarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onStrainsExtracted: (strains: ExtractedStrain[]) => void;
}

const BulkOmnibar = ({ searchTerm, onSearchChange, onStrainsExtracted }: BulkOmnibarProps) => {
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isExtracting,
    handleBulkExtraction,
    canExtract
  } = useBulkGenerationLogic({
    searchTerm,
    uploadedImage,
    onStrainsExtracted,
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

  return (
    <div className="space-y-2">
      {/* Main omnibar input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          placeholder="Type strain lists, use voice, or take photos to add multiple strains..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={isExtracting}
          className={`pl-10 pr-32 h-11 text-base border-2 transition-colors ${
            isExtracting ? 'border-green-500 bg-green-50/50' : 'focus:border-primary/50'
          }`}
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <InputControls
            isGenerating={isExtracting}
            canGenerate={canExtract}
            onVoiceClick={() => setShowVoiceInput(true)}
            onCameraClick={() => fileInputRef.current?.click()}
            onGenerate={handleBulkExtraction}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <StatusRow
        uploadedImage={uploadedImage}
        searchTerm={searchTerm}
        isGenerating={isExtracting}
        hasUser={true}
        onClearImage={clearImage}
      />

      <VoiceInput
        isOpen={showVoiceInput}
        onClose={() => setShowVoiceInput(false)}
        onResult={handleVoiceResult}
      />

      <ImageUpload
        isOpen={false}
        onClose={() => {}}
        onUpload={setUploadedImage}
      />
    </div>
  );
};

export default BulkOmnibar;
