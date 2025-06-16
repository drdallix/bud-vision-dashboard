
import React, { useState } from 'react';
import { Strain } from '@/types/strain';
import StrainHeader from './StrainHeader';
import StrainEffectsVisual from './StrainEffectsVisual';
import StrainFlavorsVisual from './StrainFlavorsVisual';
import StrainMedicalUses from './StrainMedicalUses';
import StrainCannabinoids from './StrainCannabinoids';
import StrainTerpenes from './StrainTerpenes';
import { StrainEditModal } from '@/components/StrainEditor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import QuickPrintButton from '@/components/QuickPrintButton';
import { defaultConfig } from '@/components/PrintSettings';

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

      {/* Use the visual components from showcase for better consistency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-md">
          <div className="p-4">
            <StrainEffectsVisual effectProfiles={strain.effectProfiles} />
          </div>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 shadow-md">
          <div className="p-4">
            <StrainFlavorsVisual flavorProfiles={strain.flavorProfiles} />
          </div>
        </Card>
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
