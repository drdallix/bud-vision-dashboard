
import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CameraModal from '../CameraModal';

interface ImageUploadProps {
  selectedImage: string | null;
  onImageSelect: (imageUrl: string) => void;
  onImageClear: () => void;
  disabled?: boolean;
}

// This just triggers the CameraModal; logic/workflow is handled in CameraModal now
const ImageUpload = ({ onImageSelect, disabled = false }: ImageUploadProps) => {
  const [cameraOpen, setCameraOpen] = useState(false);

  // When user taps camera icon, open modal
  const handleCameraCapture = () => {
    setCameraOpen(true);
    console.log("Camera icon clicked: Camera modal opening");
  };

  // After photo is captured & analysis starts
  // No preview, scan happens directly from CameraModal
  // The modal closes automatically after processing.
  const handleCaptured = async (imageDataUrl: string) => {
    // This will be triggered by CameraModal after its fake progress
    console.log("Picture captured, starting immediate analysis!", imageDataUrl?.substring(0, 32));
    
    // Immediately trigger the strain analysis (like text/voice input does)
    await onImageSelect(imageDataUrl);
    
    // Close camera modal after analysis starts
    setCameraOpen(false);
  };

  return (
    <>
      <Button
        onClick={handleCameraCapture}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
        disabled={disabled}
        aria-label="Open Camera"
      >
        <Camera className="h-4 w-4" />
      </Button>
      <CameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCaptured}
      />
    </>
  );
};

export default ImageUpload;
