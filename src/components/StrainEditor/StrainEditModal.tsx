
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Strain } from '@/types/strain';
import StrainBasicInfoForm from './StrainBasicInfoForm';
import StrainPricingForm from './StrainPricingForm';
import StrainDescriptionForm from './StrainDescriptionForm';
import StrainProfilesForm from './StrainProfilesForm';
import StrainActions from './StrainActions';
import { useStrainEditor } from './hooks/useStrainEditor';

interface StrainEditModalProps {
  strain: Strain | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedStrain: Strain) => void;
  onDeleted?: () => void;
}

const StrainEditModal = ({ strain, open, onClose, onSave, onDeleted }: StrainEditModalProps) => {
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
        <DialogHeader className="px-2 sm:px-6">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl">
            <span className="text-xl sm:text-2xl">🌿</span>
            <span className="truncate">Edit: {strain.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-2 sm:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
              <TabsTrigger value="basic" className="text-xs sm:text-sm px-2 py-2">
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="profiles" className="text-xs sm:text-sm px-2 py-2">
                Effects & Flavors
              </TabsTrigger>
              <TabsTrigger value="description" className="text-xs sm:text-sm px-2 py-2">
                Description
              </TabsTrigger>
              <TabsTrigger value="pricing" className="text-xs sm:text-sm px-2 py-2">
                Pricing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <StrainBasicInfoForm
                strain={editedStrain}
                errors={errors}
                onUpdate={updateField}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="profiles" className="space-y-4">
              <StrainProfilesForm
                strain={editedStrain}
                onUpdate={updateField}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="description" className="space-y-4">
              <StrainDescriptionForm
                strain={editedStrain}
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

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-muted-foreground">
              {isDirty && "• Unsaved changes"}
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleReset}
                disabled={!isDirty || isLoading}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty || isLoading}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <StrainActions strain={strain} onDeleted={onDeleted} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StrainEditModal;
