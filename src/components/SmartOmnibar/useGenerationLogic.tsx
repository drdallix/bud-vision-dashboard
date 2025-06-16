
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeStrainWithAI } from './AIAnalysis';
import { useRealtimeStrainStore } from '@/stores/useRealtimeStrainStore';
import { Strain } from '@/types/strain';
import { useToast } from '@/hooks/use-toast';

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
  const { strains, addStrain } = useRealtimeStrainStore(true);
  const { toast } = useToast();

  // Fast typing animation
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
        
        // Quick step advancement (150ms instead of 200ms)
        setTimeout(() => {
          if (generationStep < generationSteps.length - 1) {
            setGenerationStep(prev => prev + 1);
            setProgress(prev => Math.min(prev + (100 / generationSteps.length), 95));
          }
        }, 150);
      }
    }, 20); // Faster typing (20ms instead of 25ms)

    return () => clearInterval(typeWriter);
  }, [generationStep, isGenerating]);

  const checkForDuplicate = useCallback((strainName: string): boolean => {
    const normalizedName = strainName.toLowerCase().trim();
    return strains.some(strain => 
      strain.name.toLowerCase().trim() === normalizedName
    );
  }, [strains]);

  const handleGenerate = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add strains to the database.",
        variant: "destructive",
      });
      return;
    }
    
    if (!searchTerm.trim() && !uploadedImage) return;

    // Check for duplicate by name first
    if (searchTerm.trim() && checkForDuplicate(searchTerm.trim())) {
      toast({
        title: "Strain Already Exists",
        description: `"${searchTerm.trim()}" is already in the database.`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationStep(0);
    setProgress(10);
    setCurrentStepText('');

    try {
      // Start AI request immediately
      const aiPromise = analyzeStrainWithAI(uploadedImage, searchTerm.trim(), user.id);
      
      // Let animations play while AI processes (reduced to 250ms)
      await new Promise(resolve => setTimeout(resolve, 250));
      
      const result = await aiPromise;
      
      // Double-check for duplicates with the AI-generated name
      if (checkForDuplicate(result.name)) {
        toast({
          title: "Strain Already Exists",
          description: `"${result.name}" is already in the database.`,
          variant: "destructive",
        });
        return;
      }
      
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
      
      // Brief pause before finishing (reduced to 100ms)
      await new Promise(resolve => setTimeout(resolve, 100));

      addStrain(strain);
      onStrainGenerated(strain);
      onSearchChange('');
      setUploadedImage(null);
      
      toast({
        title: "Strain Added",
        description: `"${strain.name}" has been added to the database.`,
      });
    } catch (error) {
      console.error('Generation failed:', error);
      setCurrentStepText('Database search failed. Please try again.');
      toast({
        title: "Generation Failed",
        description: "Failed to generate strain profile. Please try again.",
        variant: "destructive",
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
      setProgress(0);
      setCurrentStepText('');
    }
  }, [user, searchTerm, uploadedImage, checkForDuplicate, addStrain, onStrainGenerated, onSearchChange, setUploadedImage, toast]);

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
