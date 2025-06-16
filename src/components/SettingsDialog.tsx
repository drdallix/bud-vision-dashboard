
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Settings from '@/components/Settings';
import { Strain } from '@/types/strain';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scanHistory: Strain[];
  onDataRestore: (data: Strain[]) => void;
}

const SettingsDialog = ({ 
  open, 
  onOpenChange, 
  scanHistory, 
  onDataRestore 
}: SettingsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings & Data</DialogTitle>
        </DialogHeader>
        <Settings 
          scanHistory={scanHistory} 
          onDataRestore={onDataRestore} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
