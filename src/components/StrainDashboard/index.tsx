
import { Card, CardContent } from '@/components/ui/card';
import { Database } from 'lucide-react';
import { Strain } from '@/types/strain';
import StrainHeader from './StrainHeader';
import StrainEffects from './StrainEffects';
import StrainFlavors from './StrainFlavors';
import StrainTerpenes from './StrainTerpenes';
import StrainMedicalUses from './StrainMedicalUses';
import StrainCannabinoids from './StrainCannabinoids';

interface StrainDashboardProps {
  strain: Strain | null;
}

const StrainDashboard = ({ strain }: StrainDashboardProps) => {
  if (!strain) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Database className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Strain Information</h3>
            <p className="text-muted-foreground max-w-md">
              Scan a cannabis package or select a strain from the menu to view detailed information for customer recommendations.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 slide-up">
      <StrainHeader strain={strain} />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <StrainEffects effects={strain.effects} />
        <StrainFlavors flavors={strain.flavors} />
        <StrainTerpenes terpenes={strain.terpenes} />
        <StrainMedicalUses medicalUses={strain.medicalUses} />
      </div>

      <StrainCannabinoids strain={strain} />
    </div>
  );
};

export default StrainDashboard;
