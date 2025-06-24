
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeStrainWithAI } from './AIAnalysis';
import { useStrainData } from '@/data/hooks/useStrainData';
import { useUserActivity } from '@/hooks/useUserActivity';
import { Strain } from '@/types/strain';

const processingStates = [
  "Connecting to AI...",
  "Analyzing strain data...",
  "Processing response...",
  "Finalizing profile..."
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
  const [currentState, setCurrentState] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const { user } = useAuth();
  const { addStrainToCache } = useStrainData(false);
  const { recordActivity } = useUserActivity();

  // Real-time typing animation - no artificial delays
  useEffect(() => {
    if (!isGenerating) return;

    const stepText = processingStates[currentState];
    let charIndex = 0;
    setCurrentStepText('');

    const typeWriter = setInterval(() => {
      if (charIndex <= stepText.length) {
        setCurrentStepText(stepText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeWriter);
      }
    }, 15); // Fast typing for responsiveness

    return () => clearInterval(typeWriter);
  }, [currentState, isGenerating]);

  const handleGenerate = useCallback(async () => {
    if (!user) return;
    if (!searchTerm.trim() && !uploadedImage) return;

    recordActivity('scan');

    setIsGenerating(true);
    setCurrentState(0);
    setProgress(5);
    setCurrentStepText('');

    try {
      // State 1: Connecting to AI
      setCurrentState(0);
      setProgress(15);
      
      // State 2: Start AI analysis (no delay)
      setCurrentState(1);
      setProgress(30);
      
      // Start the actual AI request
      const aiPromise = analyzeStrainWithAI(uploadedImage, searchTerm.trim(), user.id);
      
      // State 3: Processing (while AI is working)
      setCurrentState(2);
      setProgress(60);
      
      const result = await aiPromise;
      
      // State 4: Finalizing
      setCurrentState(3);
      setProgress(90);
      
      const strain: Strain = {
        ...result,
        id: Date.now().toString(),
        scannedAt: new Date().toISOString(),
        inStock: true,
        userId: user.id
      };

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
        setCurrentState(0);
        setProgress(0);
        setCurrentStepText('');
      }, 1500);
      return;
    }

    // Quick completion
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentState(0);
      setProgress(0);
      setCurrentStepText('');
    }, 200);
  }, [user, searchTerm, uploadedImage, addStrainToCache, onStrainGenerated, onSearchChange, setUploadedImage, recordActivity]);

  const canGenerate = user && (searchTerm.trim() || uploadedImage) && !isGenerating;

  return {
    isGenerating,
    generationStep: currentState,
    progress,
    currentStepText,
    generationSteps: processingStates,
    handleGenerate,
    canGenerate
  };
};
