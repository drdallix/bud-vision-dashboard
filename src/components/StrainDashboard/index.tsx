import React, { useState } from 'react';
import { Strain } from '@/types/strain';
import StrainHeader from './StrainHeader';
import StrainEffects from './StrainEffects';
import StrainFlavors from './StrainFlavors';
import StrainMedicalUses from './StrainMedicalUses';
import StrainCannabinoids from './StrainCannabinoids';
import StrainTerpenes from './StrainTerpenes';
import { StrainEditModal } from '@/components/StrainEditor';
import { Button } from '@/components/ui/button';
import QuickPrintButton from '@/components/QuickPrintButton';
import { defaultConfig } from '@/components/PrintSettings';
import { Skeleton } from '@/components/ui/skeleton';

interface StrainDashboardProps {
  strain: Strain | null;
}

const StrainDashboard: React.FC<StrainDashboardProps> = ({ strain }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStrainSave = (updatedStrain: Strain) => {
    setIsUpdating(true);
    console.log('Strain updated via dashboard:', updatedStrain.name);
    
    // Brief loading state to show feedback
    setTimeout(() => {
      setIsUpdating(false);
      setShowEdit(false);
    }, 300);
  };

  if (!strain) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No strain selected.
      </div>
    );
  }

  // Show skeleton during updates for seamless UX
  if (isUpdating) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <Skeleton className="w-64 h-80 rounded-lg" />
            <div className="flex-grow space-y-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>

        <Skeleton className="h-32 rounded-lg" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Strain Details</h2>
        <div className="flex items-center gap-2">
          <QuickPrintButton
            strain={strain}
            config={defaultConfig}
            variant="outline"
            size="default"
          />
          <Button onClick={() => setShowEdit(true)} variant="default" size="sm">
            Edit
          </Button>
        </div>
      </div>

      <StrainHeader strain={strain} />

      <StrainCannabinoids strain={strain} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StrainEffects effects={strain.effectProfiles?.map(p => p.name) || []} />
        <StrainFlavors flavors={strain.flavorProfiles?.map(p => p.name) || []} />
      </div>

      <StrainMedicalUses medicalUses={[]} />

      {strain.terpenes && strain.terpenes.length > 0 && (
        <StrainTerpenes terpenes={strain.terpenes} />
      )}

      <StrainEditModal
        strain={strain}
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={handleStrainSave}
      />
    </div>
  );
};

export default StrainDashboard;