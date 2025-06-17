
import { useState, useEffect, useCallback } from 'react';
import { Strain } from '@/types/strain';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface ValidationErrors {
  [key: string]: string;
}

export const useStrainEditor = (
  initialStrain: Strain | null,
  onSave: (updatedStrain: Strain) => void
) => {
  const [editedStrain, setEditedStrain] = useState<Strain | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Initialize edited strain when initial strain changes
  useEffect(() => {
    if (initialStrain) {
      setEditedStrain({ ...initialStrain });
      setIsDirty(false);
      setErrors({});
    }
  }, [initialStrain]);

  const updateField = useCallback((field: string, value: any) => {
    if (!editedStrain) return;

    setEditedStrain(prev => {
      if (!prev) return null;
      const updated = { ...prev, [field]: value };
      return updated;
    });
    
    setIsDirty(true);
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });
    }
  }, [editedStrain, errors]);

  const validateStrain = useCallback((strain: Strain): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    if (!strain.name?.trim()) {
      newErrors.name = 'Strain name is required';
    }
    
    if (!strain.type) {
      newErrors.type = 'Strain type is required';
    }
    
    if (strain.thc !== undefined && (strain.thc < 0 || strain.thc > 100)) {
      newErrors.thc = 'THC must be between 0 and 100';
    }
    
    if (strain.cbd !== undefined && (strain.cbd < 0 || strain.cbd > 100)) {
      newErrors.cbd = 'CBD must be between 0 and 100';
    }
    
    return newErrors;
  }, []);

  const triggerDataSync = useCallback(async () => {
    console.log('Triggering complete data sync after strain edit');
    
    // Invalidate all strain-related queries to force complete refresh
    await queryClient.invalidateQueries({ queryKey: ['strains-user'] });
    await queryClient.invalidateQueries({ queryKey: ['strains-all'] });
    
    // Force refetch all queries to ensure UI updates
    await queryClient.refetchQueries({ queryKey: ['strains-user'] });
    await queryClient.refetchQueries({ queryKey: ['strains-all'] });
    
    console.log('Data sync completed - UI should now reflect changes');
  }, [queryClient]);

  const handleSave = useCallback(async () => {
    if (!editedStrain || !user) {
      toast({
        title: "Error",
        description: "Cannot save: missing strain data or user authentication",
        variant: "destructive"
      });
      return;
    }

    // Validate strain ID
    if (!editedStrain.id || typeof editedStrain.id !== 'string') {
      console.error('Invalid strain ID for save operation:', editedStrain.id);
      toast({
        title: "Error",
        description: "Invalid strain ID. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }

    const validationErrors = validateStrain(editedStrain);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Saving strain with ID:', editedStrain.id);
      
      // Update the strain in the database
      const { error } = await supabase
        .from('scans')
        .update({
          strain_name: editedStrain.name,
          strain_type: editedStrain.type,
          description: editedStrain.description,
          thc: editedStrain.thc,
          cbd: editedStrain.cbd,
          effects: editedStrain.effectProfiles?.map(e => e.name) || [],
          flavors: editedStrain.flavorProfiles?.map(f => f.name) || [],
          medical_uses: [], // Keep empty array for legacy compatibility
          in_stock: editedStrain.inStock,
          confidence: editedStrain.confidence
        })
        .eq('id', editedStrain.id)
        .eq('user_id', user.id); // Ensure user owns the strain

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Strain saved successfully, triggering data sync');
      
      // Trigger complete data refresh to ensure UI updates
      await triggerDataSync();
      
      // Call the onSave callback with updated strain
      onSave(editedStrain);
      setIsDirty(false);
      
      toast({
        title: "Success",
        description: "Strain updated successfully - UI refreshed",
      });
    } catch (error) {
      console.error('Error saving strain:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save strain changes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [editedStrain, user, validateStrain, onSave, toast, triggerDataSync]);

  const handleReset = useCallback(() => {
    if (initialStrain) {
      setEditedStrain({ ...initialStrain });
      setIsDirty(false);
      setErrors({});
    }
  }, [initialStrain]);

  return {
    editedStrain,
    isDirty,
    isLoading,
    errors,
    updateField,
    handleSave,
    handleReset,
    triggerDataSync
  };
};
