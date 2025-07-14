import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, QrCode, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Strain } from '@/types/strain';
import QRCode from 'qrcode';

interface StrainActionsProps {
  strain: Strain;
  onDeleted?: () => void;
}

const StrainActions = ({ strain, onDeleted }: StrainActionsProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete prices first due to foreign key constraint
      const { error: pricesError } = await supabase
        .from('prices')
        .delete()
        .eq('strain_id', strain.id);

      if (pricesError) throw pricesError;

      // Delete the strain
      const { error: strainError } = await supabase
        .from('scans')
        .delete()
        .eq('id', strain.id);

      if (strainError) throw strainError;

      toast({
        title: "🗑️ Strain Deleted",
        description: `${strain.name} has been permanently removed from your database.`,
      });

      onDeleted?.();
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting strain:', error);
      toast({
        title: "❌ Delete Failed",
        description: error.message || "Failed to delete strain. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    try {
      // Create URL-friendly strain name
      const urlFriendlyName = strain.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_');
      
      const strainUrl = `${window.location.origin}/strain/${urlFriendlyName}`;
      
      const qrDataUrl = await QRCode.toDataURL(strainUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: '#16a34a',
          light: '#ffffff'
        }
      });
      
      setQrDataUrl(qrDataUrl);
      setQrModalOpen(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "❌ QR Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.download = `${strain.name.replace(/[^a-z0-9]/gi, '_')}_QR_Code.png`;
    link.href = qrDataUrl;
    link.click();
    
    toast({
      title: "📱 QR Code Downloaded",
      description: "QR code saved to your device. Scan to navigate directly to this strain!",
    });
  };

  return (
    <div className="flex gap-2 pt-4 border-t">
      <Button
        onClick={generateQRCode}
        disabled={isGeneratingQR}
        variant="outline"
        className="flex items-center gap-2 flex-1"
      >
        {isGeneratingQR ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <QrCode className="h-4 w-4" />
        )}
        Print QR
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🗑️ Delete Strain</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{strain.name}</strong>? 
              This action cannot be undone and will remove all associated data including prices and inventory records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code for {strain.name}
            </DialogTitle>
            <DialogDescription>
              Scan this QR code to navigate directly to this strain's details page.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4">
            {qrDataUrl && (
              <img 
                src={qrDataUrl} 
                alt={`QR Code for ${strain.name}`} 
                className="w-64 h-64 border rounded-lg shadow-lg"
              />
            )}
            
            <Button onClick={downloadQRCode} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StrainActions;