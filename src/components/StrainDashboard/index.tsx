
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

interface StrainDashboardProps {
  strain: Strain | null;
}

const StrainDashboard: React.FC<StrainDashboardProps> = ({ strain }) => {
  const [showEdit, setShowEdit] = useState(false);

  if (!strain) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No strain selected.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Strain Details</h2>
        <Button onClick={() => setShowEdit(true)} variant="default" size="sm">
          Edit
        </Button>
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
        onSave={() => setShowEdit(false)}
      />
    </div>
  );
};

export default StrainDashboard;
