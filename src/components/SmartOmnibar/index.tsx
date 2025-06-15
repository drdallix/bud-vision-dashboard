
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

  const handleGenerateStrain = async () => {
    if (selectedImage) {
      // Generate from image
      setIsScanning(true);
      
      try {
        toast({
          title: "Analyzing package...",
          description: "DoobieDB is reading package information.",
        });

        const aiResult = await analyzeStrainWithAI(selectedImage);
        
        const identifiedStrain: Strain = {
          ...aiResult,
          id: Date.now().toString(),
          scannedAt: new Date().toISOString(),
          imageUrl: selectedImage,
          inStock: true,
          userId: ''
        };
        
        console.log('Generated strain from image:', identifiedStrain);
        
        onStrainGenerated(identifiedStrain);
        setSelectedImage(null);
        onSearchChange('');
        
        toast({
          title: "Package analysis complete!",
          description: `Generated: ${identifiedStrain.name} (${identifiedStrain.confidence}% confidence)`,
        });
        
      } catch (error) {
        console.error('Image analysis error:', error);
        toast({
          title: "Package scan failed",
          description: "Unable to read package information. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsScanning(false);
      }
    } else if (searchTerm.trim()) {
      // Generate from text query with spelling/grammar correction
      setIsScanning(true);
      
      try {
        toast({
          title: "Generating strain information...",
          description: `Creating profile for: ${searchTerm} (fixing spelling/grammar)`,
        });

        // Use text query for AI generation with spelling correction
        const aiResult = await analyzeStrainWithAI(undefined, searchTerm.trim());
        
        const generatedStrain: Strain = {
          ...aiResult,
          id: Date.now().toString(),
          scannedAt: new Date().toISOString(),
          imageUrl: '',
          inStock: true,
          userId: ''
        };
        
        console.log('Generated strain from text:', generatedStrain);
        
        onStrainGenerated(generatedStrain);
        onSearchChange('');
        
        toast({
          title: "Strain generated!",
          description: `Created profile for: ${generatedStrain.name}`,
        });
        
      } catch (error) {
        console.error('Text generation error:', error);
        toast({
          title: "Generation failed",
          description: "Unable to generate strain information. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsScanning(false);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !hasResults && (searchTerm.trim() || selectedImage)) {
      handleGenerateStrain();
    }
  };

  const handleSearchClick = () => {
    if (!hasResults && (searchTerm.trim() || selectedImage)) {
      handleGenerateStrain();
    }
  };

  const handleVoiceTranscript = useCallback((transcript: string) => {
    onSearchChange(transcript);
  }, [onSearchChange]);

  const handleImageSelect = useCallback((imageUrl: string) => {
    setSelectedImage(imageUrl);
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
