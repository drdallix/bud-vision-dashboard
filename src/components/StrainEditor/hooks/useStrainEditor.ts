
import { useState, useEffect, useCallback } from 'react';
import { Strain } from '@/types/strain';
import { useStrainStore } from '@/stores/useStrainStore';
import { useToast } from '@/hooks/use-toast';

export interface StrainEditorErrors {
  [key: string]: string | undefined;
  name?: string;
  type?: string;
  thc?: string;
  cbd?: string;
}

export const useStrainEditor = (
  originalStrain: Strain | null,
  onSave: (updatedStrain: Strain) => void
) => {
  const [editedStrain, setEditedStrain] = useState<Strain | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<StrainEditorErrors>({});

  const { updateStock } = useStrainStore();
  const { toast } = useToast();

  // Initialize edited strain when original changes
  useEffect(() => {
    if (originalStrain) {
      setEditedStrain({ ...originalStrain });
      setIsDirty(false);
      setErrors({});
    }
  }, [originalStrain]);

  // Validation function
  const validateStrain = useCallback((strain: Strain): StrainEditorErrors => {
    const newErrors: StrainEditorErrors = {};

    if (!strain.name.trim()) {
      newErrors.name = 'Strain name is required';
    }

    if (!strain.type) {
      newErrors.type = 'Strain type is required';
    }

    if (strain.thc !== null && strain.thc !== undefined) {
      if (strain.thc < 0 || strain.thc > 100) {
        newErrors.thc = 'THC must be between 0 and 100%';
      }
    }

    if (strain.cbd !== null && strain.cbd !== undefined) {
      if (strain.cbd < 0 || strain.cbd > 100) {
        newErrors.cbd = 'CBD must be between 0 and 100%';
      }
    }

    return newErrors;
  }, []);

  // Update field function
  const updateField = useCallback((field: string, value: any) => {
    if (!originalStrain || !editedStrain) return;

    const updatedStrain = { ...editedStrain, [field]: value };
    setEditedStrain(updatedStrain);

    // Check if strain is different from original
    const hasChanges = JSON.stringify(updatedStrain) !== JSON.stringify(originalStrain);
    setIsDirty(hasChanges);

    // Clear field-specific error
    if (errors[field as keyof StrainEditorErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [originalStrain, editedStrain, errors]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!editedStrain || !originalStrain) return;

    const validationErrors = validateStrain(editedStrain);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors below before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Handle stock status change if it changed
      if (editedStrain.inStock !== originalStrain.inStock) {
        const stockUpdateSuccess = await updateStock(editedStrain.id, editedStrain.inStock);
        if (!stockUpdateSuccess) {
          throw new Error('Failed to update stock status');
        }
      }

      // Call the save callback
      onSave(editedStrain);
      setIsDirty(false);

      toast({
        title: "Strain Updated",
        description: `Successfully updated ${editedStrain.name}`,
      });
    } catch (error) {
      console.error('Error saving strain:', error);
      toast({
        title: "Save Error",
        description: "Failed to save strain changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [editedStrain, originalStrain, validateStrain, updateStock, onSave, toast]);

  // Handle reset
  const handleReset = useCallback(() => {
    if (originalStrain) {
      setEditedStrain({ ...originalStrain });
      setIsDirty(false);
      setErrors({});
    }
  }, [originalStrain]);

  return {
    editedStrain,
    isDirty,
    isLoading,
    errors,
    updateField,
    handleSave,
    handleReset,
  };
};
