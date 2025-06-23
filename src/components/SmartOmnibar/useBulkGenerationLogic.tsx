
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { extractStrainsFromText, extractStrainsFromImage, ExtractedStrain } from '@/services/bulkStrainService';

interface UseBulkGenerationLogicProps {
  searchTerm: string;
  uploadedImage: string | null;
  onStrainsExtracted: (strains: ExtractedStrain[]) => void;
  onSearchChange: (term: string) => void;
  setUploadedImage: (image: string | null) => void;
}

export const useBulkGenerationLogic = ({
  searchTerm,
  uploadedImage,
  onStrainsExtracted,
  onSearchChange,
  setUploadedImage
}: UseBulkGenerationLogicProps) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const handleBulkExtraction = async () => {
    if (!searchTerm.trim() && !uploadedImage) return;

    setIsExtracting(true);
    try {
      let result;

      if (uploadedImage) {
        // Process image
        result = await extractStrainsFromImage(uploadedImage);
        setUploadedImage(null);
      } else {
        // Process text
        result = await extractStrainsFromText(searchTerm);
        onSearchChange('');
      }

      onStrainsExtracted(result.strains);
      
      toast({
        title: "Strains Extracted",
        description: `Found ${result.strains.length} strains with ${result.confidence}% confidence.`,
      });
    } catch (error) {
      toast({
        title: "Extraction Failed",
        description: "Failed to extract strain information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const canExtract = (searchTerm.trim().length > 0 || uploadedImage) && !isExtracting;

  return {
    isExtracting,
    handleBulkExtraction,
    canExtract
  };
};
