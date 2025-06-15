
import { useState, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Strain } from '@/types/strain';
import VoiceInput from './VoiceInput';
import ImageUpload from './ImageUpload';
import { analyzeStrainWithAI } from './AIAnalysis';
import GenerateHint from './GenerateHint';

interface SmartOmnibarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onStrainGenerated: (strain: Strain) => void;
  hasResults: boolean;
}

const SmartOmnibar = ({ searchTerm, onSearchChange, onStrainGenerated, hasResults }: SmartOmnibarProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateStrain = async (imageData?: string, textQuery?: string) => {
    const analysisType = imageData ? 'image' : 'text';
    console.log(`Starting strain generation from ${analysisType}:`, textQuery || 'image data provided');
    
    setIsScanning(true);
    
    try {
      toast({
        title: imageData ? "Analyzing package..." : "Generating strain information...",
        description: imageData 
          ? "DoobieDB is reading package information."
          : `Creating profile for: ${textQuery} (fixing spelling/grammar)`,
      });

      const aiResult = await analyzeStrainWithAI(imageData, textQuery);
      
      const identifiedStrain: Strain = {
        ...aiResult,
        id: Date.now().toString(),
        scannedAt: new Date().toISOString(),
        imageUrl: imageData || '',
        inStock: true,
        userId: ''
      };
      
      console.log(`Generated strain from ${analysisType}:`, identifiedStrain);
      
      onStrainGenerated(identifiedStrain);
      setSelectedImage(null);
      onSearchChange('');
      
      toast({
        title: imageData ? "Package analysis complete!" : "Strain generated!",
        description: imageData 
          ? `Generated: ${identifiedStrain.name} (${identifiedStrain.confidence}% confidence)`
          : `Created profile for: ${identifiedStrain.name}`,
      });
      
    } catch (error) {
      console.error(`${analysisType} analysis error:`, error);
      toast({
        title: imageData ? "Package scan failed" : "Generation failed",
        description: imageData 
          ? "Unable to read package information. Please try again."
          : "Unable to generate strain information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !hasResults && searchTerm.trim()) {
      handleGenerateStrain(undefined, searchTerm.trim());
    }
  };

  const handleSearchClick = () => {
    if (!hasResults && searchTerm.trim()) {
      handleGenerateStrain(undefined, searchTerm.trim());
    }
  };

  const handleVoiceTranscript = useCallback((transcript: string) => {
    onSearchChange(transcript);
  }, [onSearchChange]);

  const handleImageSelect = useCallback(async (imageUrl: string) => {
    console.log("Image selected, starting immediate analysis");
    setSelectedImage(imageUrl);
    // Immediately start analysis for image (same as text/voice)
    await handleGenerateStrain(imageUrl, undefined);
  }, []);

  const handleImageClear = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const hasContent = Boolean(searchTerm.trim() || selectedImage);

  return (
    <div className="relative space-y-2">
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
          onClick={handleSearchClick}
        />
        <Input
          placeholder="Search inventory, describe a strain, or upload package image..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-12 pr-32 h-12 text-lg rounded-full border-2 focus:border-green-500"
          disabled={isScanning}
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {/* Image upload component */}
          <ImageUpload
            selectedImage={selectedImage}
            onImageSelect={handleImageSelect}
            onImageClear={handleImageClear}
            disabled={isScanning}
          />
          
          {/* Voice input component */}
          <VoiceInput
            onTranscript={handleVoiceTranscript}
            disabled={isScanning}
          />
          
          {/* Loading spinner */}
          {isScanning && (
            <Loader2 className="h-4 w-4 animate-spin text-green-600" />
          )}
        </div>
      </div>

      {/* Generate hint component */}
      <GenerateHint
        hasResults={hasResults}
        hasContent={hasContent}
        isScanning={isScanning}
      />
    </div>
  );
};

export default SmartOmnibar;
