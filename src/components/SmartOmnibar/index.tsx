import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Mic, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeStrainWithAI } from './AIAnalysis';
import VoiceInput from './VoiceInput';
import ImageUpload from './ImageUpload';
import GenerateHint from './GenerateHint';
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
  const { addStrainToCache } = useStrainData(false); // Get user-specific strain cache functions

  const handleGenerate = async () => {
    if (!user) {
      return;
    }

    if (!searchTerm.trim() && !uploadedImage) {
      return;
    }

    setIsGenerating(true);
    try {
      // Note: AI analysis now handles database saving, so we don't save here
      const result = await analyzeStrainWithAI(uploadedImage, searchTerm.trim(), user.id);
      
      const strain: Strain = {
        ...result,
        id: Date.now().toString(),
        scannedAt: new Date().toISOString(),
        inStock: true,
        userId: user.id
      };

      console.log('SmartOmnibar - strain generated:', strain);
      
      // Add to user's strain cache for immediate background update
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

  return (
    <div className="space-y-4">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search strains or describe what you're looking for..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 h-12 text-base"
              />
            </div>

            {uploadedImage && (
              <div className="relative inline-block">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded cannabis package" 
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={clearImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVoiceInput(true)}
                className="flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                Voice
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Upload
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <Button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="flex items-center gap-2 cannabis-gradient text-white"
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate Info'}
              </Button>
            </div>

            {!user && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                <Badge variant="outline">Sign in required</Badge>
                <span>Sign in to generate strain information</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <GenerateHint searchTerm={searchTerm} hasResults={hasResults} />

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
