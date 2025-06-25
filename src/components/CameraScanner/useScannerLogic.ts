
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeStrainWithAI } from '@/components/SmartOmnibar/AIAnalysis';
import { CacheService } from '@/services/cacheService';
import { useStrainData } from '@/data/hooks/useStrainData';
import { Strain } from '@/types/strain';

export const useScannerLogic = (onScanComplete: (strain: Strain) => void) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'failed' | 'cached'>('idle');
  const { toast } = useToast();
  const { user } = useAuth();
  const { addStrainToCache } = useStrainData(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSelectedImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!selectedImage) {
      toast({
        title: "No package image selected",
        description: "Please capture or select a package image first.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your scans.",
        variant: "destructive",
      });
      return;
    }
    
    setIsScanning(true);
    setSaveStatus('saving');
    
    try {
      toast({
        title: "Analyzing package...",
        description: "DoobieDB is reading package information for customer recommendations.",
      });

      // The AI analysis now handles database saving and returns the complete strain with database ID
      const aiResult = await analyzeStrainWithAI(selectedImage, undefined, user.id);
      
      // CRITICAL FIX: Ensure we have a valid database ID before proceeding
      if (!aiResult.id) {
        throw new Error('No database ID returned from strain analysis');
      }
      
      // Create strain object using ONLY the database ID from the AI result
      const identifiedStrain: Strain = {
        ...aiResult,
        id: aiResult.id, // Use ONLY the database ID - no fallback
        scannedAt: new Date().toISOString(),
        inStock: true,
        userId: user.id
      };
      
      console.log('Scanner - strain analyzed with verified database ID:', identifiedStrain.id);
      
      // Save to local cache as backup
      CacheService.saveScanToCache(identifiedStrain, 'synced');
      
      // Add to the user's strain cache immediately for UI update
      addStrainToCache(identifiedStrain);
      
      setSaveStatus('success');
      setIsScanning(false);
      onScanComplete(identifiedStrain);
      setSelectedImage(null);
      
      toast({
        title: "Package analysis complete!",
        description: `Saved: ${identifiedStrain.name} (${identifiedStrain.confidence}% confidence)`,
      });

      console.log('Scan complete - strain with proper database ID should now be editable');
      
    } catch (error) {
      console.error('Scan error:', error);
      setIsScanning(false);
      setSaveStatus('failed');
      
      toast({
        title: "Package scan failed",
        description: error.message || "Unable to read package information. Please ensure good lighting and clear text visibility.",
        variant: "destructive",
      });
    }
  };

  return {
    selectedImage,
    isScanning,
    saveStatus,
    handleImageUpload,
    handleScan,
    setIsScanning
  };
};
