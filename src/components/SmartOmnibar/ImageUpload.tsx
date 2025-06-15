
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

const ImageUpload = ({ onImageSelect, disabled = false }: ImageUploadProps) => {
  const [cameraOpen, setCameraOpen] = useState(false);

  // When user taps camera icon, open modal
  const handleCameraCapture = () => {
    setCameraOpen(true);
  };

  // When photo is captured, trigger AI analysis immediately
  const handleCaptured = (imageDataUrl: string) => {
    setCameraOpen(false);
    // Fire parent action to start scan/analyze. We do not preview, but run immediately.
    onImageSelect(imageDataUrl);
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
