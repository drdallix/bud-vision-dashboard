
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Strain } from '@/types/strain';
import { supabase } from '@/integrations/supabase/client';
import StrainBasicInfoForm from './StrainBasicInfoForm';
import StrainDescriptionForm from './StrainDescriptionForm';
import StrainProfilesForm from './StrainProfilesForm';
import StrainEditSkeleton from './StrainEditSkeleton';

interface StrainEditModalProps {
  strain: Strain;
  open: boolean;
  onClose: () => void;
  onSave: (strain: Strain) => void;
}

const StrainEditModal = ({ strain, open, onClose, onSave }: StrainEditModalProps) => {
  const [editedStrain, setEditedStrain] = useState<Strain>(strain);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('scans')
        .update({
          strain_name: editedStrain.name,
          strain_type: editedStrain.type,
          description: editedStrain.description,
          effects: editedStrain.effectProfiles?.map(e => e.name) || [],
          flavors: editedStrain.flavorProfiles?.map(f => f.name) || [],
          thc: editedStrain.thc,
          cbd: editedStrain.cbd,
          in_stock: editedStrain.inStock,
        })
        .eq('id', strain.id);

      if (error) throw error;

      // Simulate network delay for smooth skeleton transition
      await new Promise(resolve => setTimeout(resolve, 800));

      toast({
        title: "Strain Updated",
        description: `${editedStrain.name} has been successfully updated.`,
      });

      onSave(editedStrain);
      onClose();
    } catch (error) {
      console.error('Error updating strain:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update strain. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    setEditedStrain(strain);
  }, [strain, open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Strain: {strain.name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <StrainEditSkeleton />
        ) : (
          <div className="space-y-6">
            <StrainBasicInfoForm 
              strain={editedStrain} 
              onStrainChange={setEditedStrain} 
            />
            
            <StrainDescriptionForm 
              strain={editedStrain} 
              onStrainChange={setEditedStrain} 
            />
            
            <StrainProfilesForm 
              strain={editedStrain} 
              onStrainChange={setEditedStrain} 
            />

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StrainEditModal;
