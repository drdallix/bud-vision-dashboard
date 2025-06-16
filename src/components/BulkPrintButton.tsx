
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Strain } from '@/types/strain';
import PrintManager from '@/components/PrintManager';

interface BulkPrintButtonProps {
  strains: Strain[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const BulkPrintButton = ({ 
  strains, 
  variant = 'outline', 
  size = 'default'
}: BulkPrintButtonProps) => {
  const [showPrintManager, setShowPrintManager] = useState(false);

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        onClick={() => setShowPrintManager(true)}
        disabled={strains.length === 0}
      >
        <Printer className="h-4 w-4 mr-2" />
        Bulk Print
      </Button>

      <PrintManager
        open={showPrintManager}
        onOpenChange={setShowPrintManager}
        strains={strains}
      />
    </>
  );
};

export default BulkPrintButton;
