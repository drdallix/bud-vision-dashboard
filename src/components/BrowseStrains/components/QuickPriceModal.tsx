
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StrainPricingForm from '@/components/StrainEditor/StrainPricingForm';

interface QuickPriceModalProps {
  open: boolean;
  onClose: () => void;
  strainId: string;
}

const QuickPriceModal = ({ open, onClose, strainId }: QuickPriceModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            💵 Quick Price Edit
          </DialogTitle>
        </DialogHeader>
        <StrainPricingForm strainId={strainId} isLoading={false} />
      </DialogContent>
    </Dialog>
  );
};

export default QuickPriceModal;
