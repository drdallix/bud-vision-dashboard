
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Strain } from '@/types/strain';
import StrainBasicInfoForm from './StrainBasicInfoForm';
import StrainPricingForm from './StrainPricingForm';
import { useStrainEditor } from './hooks/useStrainEditor';

interface StrainEditModalProps {
  strain: Strain | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedStrain: Strain) => void;
}

const StrainEditModal = ({ strain, open, onClose, onSave }: StrainEditModalProps) => {
  const [activeTab, setActiveTab] = useState('basic');
  
  const {
    editedStrain,
    isDirty,
    isLoading,
    errors,
    updateField,
    handleSave,
    handleReset
  } = useStrainEditor(strain, onSave);

  if (!strain || !editedStrain) return null;

  const handleClose = () => {
    if (isDirty) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            Edit Strain: {strain.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <StrainBasicInfoForm
              strain={editedStrain}
              errors={errors}
              onUpdate={updateField}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <StrainPricingForm
              strainId={strain.id}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {isDirty && "• Unsaved changes"}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={!isDirty || isLoading}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || isLoading}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StrainEditModal;
