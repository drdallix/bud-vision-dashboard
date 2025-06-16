
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeStrainWithAI } from './AIAnalysis';
import { useStrainData } from '@/data/hooks/useStrainData';
import { ensureStrainHasDefaultTone } from '@/services/toneService';
import { Strain } from '@/types/strain';

const generationSteps = [
  "Analyzing input data...",
  "Processing strain characteristics...",
  "Identifying effects and flavors...",
  "Calculating THC/CBD levels...",
  "Generating terpene profile...",
  "Creating strain description...",
  "Setting up tone system...",
  "Finalizing results..."
];

interface UseGenerationLogicProps {
  searchTerm: string;
  uploadedImage: string | null;
  onStrainGenerated: (strain: Strain) => void;
  onSearchChange: (term: string) => void;
  setUploadedImage: (image: string | null) => void;
}

// Generate a proper UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useGenerationLogic = ({
  searchTerm,
  uploadedImage,
  onStrainGenerated,
  onSearchChange,
  setUploadedImage
}: UseGenerationLogicProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
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

  const handleGenerate = useCallback(async () => {
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
        id: generateUUID(), // Use proper UUID instead of timestamp
        scannedAt: new Date().toISOString(),
        inStock: true,
        userId: user.id
      };

      console.log('Generated strain before tone safety:', strain.name);

      // NEW: Ensure tone safety before cache update
      try {
        const safeTonerData = await ensureStrainHasDefaultTone(strain, user.id);
        console.log('Tone safety ensured for strain:', strain.name, safeTonerData);
        
        // Update strain description with the safe tone description if needed
        if (safeTonerData.description && safeTonerData.description !== strain.description) {
          strain.description = safeTonerData.description;
        }
      } catch (toneError) {
        console.error('Tone safety setup failed, but continuing with strain generation:', toneError);
        // Continue with strain generation even if tone setup fails
      }

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
  }, [user, searchTerm, uploadedImage, addStrainToCache, onStrainGenerated, onSearchChange, setUploadedImage]);

  const canGenerate = user && (searchTerm.trim() || uploadedImage) && !isGenerating;

  return {
    isGenerating,
    generationStep,
    progress,
    currentStepText,
    generationSteps,
    handleGenerate,
    canGenerate
  };
};
