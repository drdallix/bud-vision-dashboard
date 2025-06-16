
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStrainData } from '@/data/hooks/useStrainData';
import { Strain } from '@/types/strain';
import { 
  ensureStrainHasDefaultTone, 
  safelyFetchToneDescriptions, 
  safelyFetchAvailableTones 
} from '@/services/toneService';
import { useToneGeneration } from './hooks/useToneGeneration';
import { useToneOperations } from './hooks/useToneOperations';
import type { Tables } from '@/integrations/supabase/types';

type Tone = Tables<'user_tones'>;

/**
 * Safe Tone Logic Hook
 * 
 * This is a refactored version of useToneLogic that provides better error handling,
 * loading states, and separation of concerns. It prevents crashes when tone data
 * is missing or when database operations fail.
 */
export const useSafeToneLogic = (strain: Strain, onDescriptionChange: (description: string) => void) => {
  const [availableTones, setAvailableTones] = useState<Tone[]>([]);
  const [selectedToneId, setSelectedToneId] = useState<string>('');
  const [storedDescriptions, setStoredDescriptions] = useState<Record<string, string>>({});
  const [currentDescription, setCurrentDescription] = useState(strain.description || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const { updateStrainInCache } = useStrainData(true);

  // Use the separated tone generation logic
  const toneGeneration = useToneGeneration(strain, user, selectedToneId, storedDescriptions, setStoredDescriptions);
  const toneOperations = useToneOperations(user, selectedToneId, availableTones, storedDescriptions, updateStrainInCache);

  /**
   * Initialize tone system with safety measures
   */
  const initializeToneSystem = useCallback(async () => {
    if (!strain.id) {
      setError('Invalid strain data');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Step 1: Ensure strain has default tone (prevents crashes)
      console.log('Ensuring strain has default tone:', strain.name);
      const safeTonerData = await ensureStrainHasDefaultTone(strain, user?.id);
      
      // Step 2: Fetch available tones safely
      console.log('Fetching available tones...');
      const tones = await safelyFetchAvailableTones(user?.id);
      setAvailableTones(tones);

      // Step 3: Fetch stored descriptions safely
      console.log('Fetching stored descriptions...');
      const descriptions = await safelyFetchToneDescriptions(strain.id);
      setStoredDescriptions(descriptions);

      // Step 4: Set initial state
      if (tones.length > 0) {
        const initialToneId = safeTonerData.toneId || tones[0].id;
        setSelectedToneId(initialToneId);
        
        const initialDescription = descriptions[initialToneId] || safeTonerData.description || strain.description || '';
        setCurrentDescription(initialDescription);
        onDescriptionChange(initialDescription);
        updateStrainInCache(strain.id, { description: initialDescription });
      }

      console.log('Tone system initialized successfully for:', strain.name);
    } catch (initError) {
      console.error('Error initializing tone system:', initError);
      setError('Failed to initialize tone system');
      
      // Fallback: use original strain description
      const fallbackDescription = strain.description || `${strain.name} is a ${strain.type.toLowerCase()} strain.`;
      setCurrentDescription(fallbackDescription);
      onDescriptionChange(fallbackDescription);
    } finally {
      setIsLoading(false);
    }
  }, [strain, user?.id, onDescriptionChange, updateStrainInCache]);

  // Initialize when strain or user changes
  useEffect(() => {
    if (strain.id) {
      initializeToneSystem();
    }
  }, [strain.id, user?.id, initializeToneSystem]);

  /**
   * Switch to a different tone safely
   */
  const switchToTone = useCallback((toneId: string) => {
    try {
      setSelectedToneId(toneId);
      const description = storedDescriptions[toneId] || strain.description || '';
      setCurrentDescription(description);
      onDescriptionChange(description);
      updateStrainInCache(strain.id, { description });

      // Generate description in background if none exists
      if (!storedDescriptions[toneId]) {
        toneGeneration.generateDescriptionForTone(toneId, true);
      }
    } catch (switchError) {
      console.error('Error switching tone:', switchError);
    }
  }, [storedDescriptions, strain, onDescriptionChange, updateStrainInCache, toneGeneration]);

  /**
   * Get current tone name safely
   */
  const getCurrentToneName = useCallback(() => {
    const tone = availableTones.find(t => t.id === selectedToneId);
    return tone?.name || 'Professional';
  }, [availableTones, selectedToneId]);

  /**
   * Check if tone has stored description
   */
  const hasStoredDescription = useCallback((toneId: string) => {
    return !!storedDescriptions[toneId];
  }, [storedDescriptions]);

  // Update stored descriptions when tone generation completes
  useEffect(() => {
    if (toneGeneration.selectedToneId === selectedToneId && toneGeneration.currentDescription) {
      setCurrentDescription(toneGeneration.currentDescription);
      onDescriptionChange(toneGeneration.currentDescription);
      updateStrainInCache(strain.id, { description: toneGeneration.currentDescription });
    }
  }, [toneGeneration.selectedToneId, toneGeneration.currentDescription, selectedToneId, onDescriptionChange, updateStrainInCache, strain.id]);

  return {
    // Data
    availableTones,
    selectedToneId,
    storedDescriptions,
    currentDescription,
    
    // State
    isLoading,
    error,
    isGenerating: toneGeneration.isGenerating,
    isApplyingGlobally: toneOperations.isApplyingGlobally,
    globalProgress: toneOperations.globalProgress,
    
    // Actions
    switchToTone,
    generateDescriptionForTone: toneGeneration.generateDescriptionForTone,
    applyToneToAllStrains: toneOperations.applyToneToAllStrains,
    
    // Helpers
    getCurrentToneName,
    hasStoredDescription,
  };
};
