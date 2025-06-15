
import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Mic, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeStrainWithAI } from './AIAnalysis';
import VoiceInput from './VoiceInput';
import ImageUpload from './ImageUpload';
import { useStrainData } from '@/data/hooks/useStrainData';
import { Strain } from '@/types/strain';

interface SmartOmnibarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onStrainGenerated: (strain: Strain) => void;
  hasResults: boolean;
}

const SmartOmnibar = ({ searchTerm, onSearchChange, onStrainGenerated, hasResults }: SmartOmnibarProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { addStrainToCache } = useStrainData(false);

  const handleGenerate = async () => {
    if (!user) return;
    if (!searchTerm.trim() && !uploadedImage) return;

    setIsGenerating(true);
    try {
      const result = await analyzeStrainWithAI(uploadedImage, searchTerm.trim(), user.id);
      
      const strain: Strain = {
        ...result,
        id: Date.now().toString(),
        scannedAt: new Date().toISOString(),
        inStock: true,
        userId: user.id
      };

      addStrainToCache(strain);
      onStrainGenerated(strain);
      onSearchChange('');
      setUploadedImage(null);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

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

  const canGenerate = user && (searchTerm.trim() || uploadedImage) && !isGenerating;
  const showHint = !hasResults && searchTerm.trim().length > 0;

  return (
    <div className="space-y-2">
      {/* Main omnibar input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          placeholder="Search strains or describe what you're looking for..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-32 h-11 text-base border-2 focus:border-primary/50 transition-colors"
        />
        
        {/* Action buttons inside input */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVoiceInput(true)}
            className="h-7 w-7 p-0 hover:bg-muted"
          >
            <Mic className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-7 w-7 p-0 hover:bg-muted"
          >
            <Camera className="h-3.5 w-3.5" />
          </Button>

          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            size="sm"
            className="h-7 px-2 cannabis-gradient text-white text-xs"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            {isGenerating ? '...' : 'AI'}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Image preview and hint row */}
      {(uploadedImage || showHint || !user) && (
        <div className="flex items-center justify-between min-h-[24px]">
          <div className="flex items-center gap-2">
            {uploadedImage && (
              <div className="relative inline-block">
                <img 
                  src={uploadedImage} 
                  alt="Package" 
                  className="w-6 h-6 object-cover rounded border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-1 -right-1 h-3 w-3 rounded-full p-0"
                  onClick={clearImage}
                >
                  <X className="h-2 w-2" />
                </Button>
              </div>
            )}
            
            {showHint && (
              <div className="text-xs text-green-600">
                💡 Press AI to analyze "{searchTerm}"
              </div>
            )}
          </div>

          {!user && (
            <Badge variant="outline" className="text-xs">
              Sign in to use AI
            </Badge>
          )}
        </div>
      )}

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
