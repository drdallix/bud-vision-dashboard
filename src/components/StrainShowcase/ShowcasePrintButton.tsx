
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Strain } from '@/types/strain';
import ShowcasePrintDialog from './ShowcasePrintDialog';

interface ShowcasePrintButtonProps {
  filteredStrains: Strain[];
  filterSummary: {
    filterType: string;
    sortBy: string;
    selectedEffects: string[];
    selectedFlavors: string[];
    stockFilter: string;
    thcRange: [number, number];
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const ShowcasePrintButton = ({ 
  filteredStrains, 
  filterSummary,
  variant = 'outline', 
  size = 'default'
}: ShowcasePrintButtonProps) => {
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        onClick={() => setShowPrintDialog(true)}
        disabled={filteredStrains.length === 0}
      >
        <Printer className="h-4 w-4 mr-2" />
        Print Menu
      </Button>

      <ShowcasePrintDialog
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
        filteredStrains={filteredStrains}
        filterSummary={filterSummary}
      />
    </>
  );
};

export default ShowcasePrintButton;
