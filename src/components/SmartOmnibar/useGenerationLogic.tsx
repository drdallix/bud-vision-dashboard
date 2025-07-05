
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeStrainWithAI } from './AIAnalysis';
import { useStrainData } from '@/data/hooks/useStrainData';
import { useUserActivity } from '@/hooks/useUserActivity';
import { Strain } from '@/types/strain';

const processingSteps = [
  "Initializing DoobieDB AI analyzer...",
  "Connecting to cannabis knowledge base...",
  "Processing strain information with GPT-4...",
  "Analyzing cannabinoid profiles...",
  "Cross-referencing terpene data...",
  "Evaluating effects and flavors...",
  "Finalizing strain profile...",
  "Saving to your collection..."
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

  const animateGenerationSteps = async (onEarlyComplete?: () => void) => {
    let completed = false;
    
    const runStep = async (stepIndex: number) => {
      if (completed || stepIndex >= processingSteps.length) return;
      
      setGenerationStep(stepIndex);
      setCurrentStepText(processingSteps[stepIndex]);
      
      // Progressive animation for each step
      const stepProgress = (stepIndex / processingSteps.length) * 100;
      const nextStepProgress = ((stepIndex + 1) / processingSteps.length) * 100;
      
      // Animate progress within the step
      const stepDuration = stepIndex === 0 ? 800 : 
                          stepIndex === processingSteps.length - 1 ? 400 : 
                          600 + Math.random() * 400; // Vary timing realistically
      
      const startTime = Date.now();
      const animateStepProgress = () => {
        if (completed) return;
        
        const elapsed = Date.now() - startTime;
        const stepCompletion = Math.min(elapsed / stepDuration, 1);
        const currentProgress = stepProgress + (nextStepProgress - stepProgress) * stepCompletion;
        
        setProgress(currentProgress);
        
        if (stepCompletion < 1) {
          requestAnimationFrame(animateStepProgress);
        } else {
          setTimeout(() => runStep(stepIndex + 1), 100);
        }
      };
      
      animateStepProgress();
    };
    
    runStep(0);
    
    return {
      complete: () => {
        completed = true;
        setProgress(100);
        if (onEarlyComplete) onEarlyComplete();
      }
    };
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
      // Start animation sequence and AI analysis
      const animationController = await animateGenerationSteps();
      const aiPromise = analyzeStrainWithAI(uploadedImage, searchTerm.trim(), user.id);
      
      // Wait for AI result and complete animation early if needed
      const result = await aiPromise;
      animationController.complete();
      
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
