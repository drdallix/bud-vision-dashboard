
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeStrainWithAI } from './AIAnalysis';
import { useStrainData } from '@/data/hooks/useStrainData';
import { useUserActivity } from '@/hooks/useUserActivity';
import { Strain } from '@/types/strain';

const generationSteps = [
  "Scanning cannabis databases...",
  "Cross-referencing strain genetics...",
  "Analyzing terpene profiles...",
  "Compiling lab results...",
  "Finalizing strain profile..."
];

interface UseGenerationLogicProps {
  searchTerm: string;
  uploadedImage: string | null;
  onStrainGenerated: (strain: Strain) => void;
  onSearchChange: (term: string) => void;
  setUploadedImage: (image: string | null) => void;
}

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
  const { recordActivity, getOptimalDelay } = useUserActivity();

  // Optimized typing animation with dynamic delay
  useEffect(() => {
    if (!isGenerating) return;

    const stepText = generationSteps[generationStep];
    let charIndex = 0;
    setCurrentStepText('');

    const optimalDelay = getOptimalDelay();
    const typeDelay = Math.max(optimalDelay, 25); // Minimum 25ms for readability

    const typeWriter = setInterval(() => {
      if (charIndex <= stepText.length) {
        setCurrentStepText(stepText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeWriter);
        
        // Reduced step advancement delay
        setTimeout(() => {
          if (generationStep < generationSteps.length - 1) {
            setGenerationStep(prev => prev + 1);
            setProgress(prev => Math.min(prev + (100 / generationSteps.length), 95));
          }
        }, 150); // Reduced from 200ms
      }
    }, typeDelay);

    return () => clearInterval(typeWriter);
  }, [generationStep, isGenerating, getOptimalDelay]);

  const handleGenerate = useCallback(async () => {
    if (!user) return;
    if (!searchTerm.trim() && !uploadedImage) return;

    // Record the scan activity
    recordActivity('scan');

    setIsGenerating(true);
    setGenerationStep(0);
    setProgress(10);
    setCurrentStepText('');

    try {
      // Start AI request immediately, don't wait for animations
      const aiPromise = analyzeStrainWithAI(uploadedImage, searchTerm.trim(), user.id);
      
      // Reduced initial wait time
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const result = await aiPromise;
      
      const strain: Strain = {
        ...result,
        id: Date.now().toString(),
        scannedAt: new Date().toISOString(),
        inStock: true,
        userId: user.id
      };

      // Complete progress quickly
      setProgress(100);
      setCurrentStepText('Database search complete!');
      
      // Brief pause before finishing
      await new Promise(resolve => setTimeout(resolve, 100));

      addStrainToCache(strain);
      onStrainGenerated(strain);
      onSearchChange('');
      setUploadedImage(null);
    } catch (error) {
      console.error('Generation failed:', error);
      setCurrentStepText('Database search failed. Please try again.');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
      setProgress(0);
      setCurrentStepText('');
    }
  }, [user, searchTerm, uploadedImage, addStrainToCache, onStrainGenerated, onSearchChange, setUploadedImage, recordActivity]);

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
