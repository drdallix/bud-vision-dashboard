
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Strain } from '@/types/strain';
import StrainBasicInfoForm from './StrainBasicInfoForm';
import StrainPricingForm from './StrainPricingForm';
import StrainDescriptionForm from './StrainDescriptionForm';
import StrainProfilesForm from './StrainProfilesForm';
import StrainEditSkeleton from './StrainEditSkeleton';
import { useStrainEditor } from './hooks/useStrainEditor';

interface StrainEditModalProps {
  strain: Strain | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedStrain: Strain) => void;
}

const StrainEditModal = ({ strain, open, onClose, onSave }: StrainEditModalProps) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    editedStrain,
    isDirty,
    isLoading,
    errors,
    updateField,
    handleSave: originalHandleSave,
    handleReset,
    triggerDataSync
  } = useStrainEditor(strain, onSave);

  // Enhanced save handler with complete data refresh and page reload
  const handleSave = async () => {
    setIsRefreshing(true);
    try {
      await originalHandleSave();
      // The page will refresh automatically from the hook, so we don't need additional logic here
    } catch (error) {
      setIsRefreshing(false);
      throw error;
    }
  };

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
          {isRefreshing ? (
            <div className="space-y-4">
              <StrainEditSkeleton />
              <div className="text-center text-sm text-green-600 font-medium">
                Saving strain and refreshing page to ensure UI accuracy...
              </div>
            </div>
          ) : (
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
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-muted-foreground">
              {isDirty && "• Unsaved changes"}
              {isRefreshing && "• Saving and refreshing page..."}
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleReset}
                disabled={!isDirty || isLoading || isRefreshing}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty || isLoading || isRefreshing}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading || isRefreshing ? 'Saving & Refreshing...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StrainEditModal;
