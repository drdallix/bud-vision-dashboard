
import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CameraModal from '../CameraModal';

interface ImageUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (imageUrl: string) => void;
}

const ImageUpload = ({ isOpen, onClose, onUpload }: ImageUploadProps) => {
  // When user captures photo and analysis starts
  const handleCaptured = async (imageDataUrl: string) => {
    console.log("Picture captured, starting immediate analysis!", imageDataUrl?.substring(0, 32));
    
    // Immediately trigger the strain analysis
    await onUpload(imageDataUrl);
    
    // Close camera modal after analysis starts
    onClose();
  };

  return (
    <CameraModal
      open={isOpen}
      onClose={onClose}
      onCapture={handleCaptured}
    />
  );
};

export default ImageUpload;
