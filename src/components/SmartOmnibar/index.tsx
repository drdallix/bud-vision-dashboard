
import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Mic, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

const generationSteps = [
  "Analyzing input data...",
  "Processing strain characteristics...",
  "Identifying effects and flavors...",
  "Calculating THC/CBD levels...",
  "Generating terpene profile...",
  "Creating strain description...",
  "Finalizing results..."
];

const SmartOmnibar = ({ searchTerm, onSearchChange, onStrainGenerated, hasResults }: SmartOmnibarProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { addStrainToCache } = useStrainData(false);

  // Animation for step text
  useEffect(() => {
    if (!isGenerating) return;

    const stepText = generationSteps[generationStep];
    let charIndex = 0;
    setCurrentStepText('');

    const typeWriter = setInterval(() => {
      if (charIndex <= stepText.length) {
        setCurrentStepText(stepText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeWriter);
        
        // Move to next step after a brief pause
        setTimeout(() => {
          if (generationStep < generationSteps.length - 1) {
            setGenerationStep(prev => prev + 1);
            setProgress(prev => Math.min(prev + (100 / generationSteps.length), 95));
          }
        }, 800);
      }
    }, 50);

    return () => clearInterval(typeWriter);
  }, [generationStep, isGenerating]);

  const handleGenerate = async () => {
    if (!user) return;
    if (!searchTerm.trim() && !uploadedImage) return;

    setIsGenerating(true);
    setGenerationStep(0);
    setProgress(5);
    setCurrentStepText('');

    try {
      // Simulate more realistic timing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await analyzeStrainWithAI(uploadedImage, searchTerm.trim(), user.id);
      
      const strain: Strain = {
        ...result,
        id: Date.now().toString(),
        scannedAt: new Date().toISOString(),
        inStock: true,
        userId: user.id
      };

      // Complete the progress
      setProgress(100);
      setCurrentStepText('Generation complete!');
      
      // Brief pause before finishing
      await new Promise(resolve => setTimeout(resolve, 500));

      addStrainToCache(strain);
      onStrainGenerated(strain);
      onSearchChange('');
      setUploadedImage(null);
    } catch (error) {
      console.error('Generation failed:', error);
      setCurrentStepText('Generation failed. Please try again.');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
      setProgress(0);
      setCurrentStepText('');
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
  const showHint = !hasResults && searchTerm.trim().length > 0 && !isGenerating;

  return (
    <div className="space-y-2">
      {/* Main omnibar input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          placeholder="Search strains or describe what you're looking for..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={isGenerating}
          className={`pl-10 pr-32 h-11 text-base border-2 transition-colors ${
            isGenerating ? 'border-green-500 bg-green-50/50' : 'focus:border-primary/50'
          }`}
        />
        
        {/* Action buttons inside input */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVoiceInput(true)}
            disabled={isGenerating}
            className="h-7 w-7 p-0 hover:bg-muted"
          >
            <Mic className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isGenerating}
            className="h-7 w-7 p-0 hover:bg-muted"
          >
            <Camera className="h-3.5 w-3.5" />
          </Button>

          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            size="sm"
            className={`h-7 px-2 text-white text-xs transition-all ${
              isGenerating 
                ? 'bg-green-600 animate-pulse' 
                : 'cannabis-gradient hover:scale-105'
            }`}
          >
            <Sparkles className={`h-3 w-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'AI' : 'AI'}
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

      {/* Generation progress and feedback */}
      {isGenerating && (
        <div className="space-y-3 animate-fade-in">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-600 animate-spin" />
                <span className="text-sm font-medium text-green-800">AI Generating Strain</span>
              </div>
              <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Step {generationStep + 1} of {generationSteps.length}
              </div>
            </div>
            
            <Progress value={progress} className="mb-3 h-2" />
            
            <div className="text-sm text-green-700 min-h-[20px] font-mono">
              {currentStepText}
              <span className="animate-pulse">|</span>
            </div>
          </div>
        </div>
      )}

      {/* Image preview and hint row */}
      {(uploadedImage || showHint || !user) && !isGenerating && (
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
