
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeStrainWithAI } from './AIAnalysis';
import { useStrainData } from '@/data/hooks/useStrainData';
import { useUserActivity } from '@/hooks/useUserActivity';
import { Strain } from '@/types/strain';

const processingSteps = [
  "Initializing DoobieDB AI analyzer...",
  "Processing strain information with GPT-4...",
  "Analyzing effects and terpene profiles...",
  "Cross-referencing cannabis database...",
  "Generating detailed strain profile...",
  "Finalizing recommendation data..."
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
  const { recordActivity } = useUserActivity();

  const animateGenerationSteps = async () => {
    for (let i = 0; i < processingSteps.length; i++) {
      setGenerationStep(i);
      setCurrentStepText(processingSteps[i]);
      setProgress(((i + 1) / processingSteps.length) * 100);
      
      // Realistic timing for each step
      const stepDuration = i === 0 ? 600 : i === processingSteps.length - 1 ? 400 : 900;
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!user) return;
    if (!searchTerm.trim() && !uploadedImage) return;

    recordActivity('scan');

    setIsGenerating(true);
    setGenerationStep(0);
    setProgress(0);
    setCurrentStepText('');

    try {
      // Start animation sequence alongside AI analysis
      const animationPromise = animateGenerationSteps();
      const aiPromise = analyzeStrainWithAI(uploadedImage, searchTerm.trim(), user.id);
      
      // Wait for both animation and AI analysis to complete
      const [, result] = await Promise.all([animationPromise, aiPromise]);
      
      // CRITICAL FIX: Only use the database ID from the AI result - no fallback to timestamp
      if (!result.id) {
        throw new Error('No database ID returned from strain generation');
      }

      const strain: Strain = {
        ...result,
        id: result.id, // Use ONLY the database ID from the edge function
        scannedAt: new Date().toISOString(),
        inStock: true,
        userId: user.id
      };

      console.log('Generated strain with verified database ID:', strain.id);

      // Complete immediately
      setProgress(100);
      setCurrentStepText('Profile generated successfully!');

      addStrainToCache(strain);
      onStrainGenerated(strain);
      onSearchChange('');
      setUploadedImage(null);
      
    } catch (error) {
      console.error('Generation failed:', error);
      setCurrentStepText('Generation failed. Please try again.');
      // Brief error display then reset
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationStep(0);
        setProgress(0);
        setCurrentStepText('');
      }, 1500);
      return;
    }

    // Quick completion
    setTimeout(() => {
      setIsGenerating(false);
      setGenerationStep(0);
      setProgress(0);
      setCurrentStepText('');
    }, 200);
  }, [user, searchTerm, uploadedImage, addStrainToCache, onStrainGenerated, onSearchChange, setUploadedImage, recordActivity]);

  const canGenerate = user && (searchTerm.trim() || uploadedImage) && !isGenerating;

  return {
    isGenerating,
    generationStep,
    progress,
    currentStepText,
    generationSteps: processingSteps,
    handleGenerate,
    canGenerate
  };
};
