
import { useRef } from 'react';
import { Camera, Upload, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraCaptureControlsProps {
  selectedImage: string | null;
  isScanning: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onScan: () => void;
  disabled?: boolean;
}

const CameraCaptureControls = ({ 
  selectedImage, 
  isScanning, 
  onImageUpload, 
  onScan,
  disabled = false 
}: CameraCaptureControlsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={handleCameraCapture}
          className="flex-1 h-12"
          variant="outline"
          disabled={isScanning || disabled}
        >
          <Camera className="h-4 w-4 mr-2" />
          Capture Package
        </Button>
        
        <Button 
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 h-12"
          variant="outline" 
          disabled={isScanning || disabled}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Image
        </Button>
        
        <Button 
          onClick={onScan}
          className="flex-1 h-12 cannabis-gradient text-white"
          disabled={!selectedImage || isScanning || disabled}
        >
          <Scan className="h-4 w-4 mr-2" />
          {isScanning ? 'Analyzing...' : 'Scan Package'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onImageUpload}
        className="hidden"
      />
    </>
  );
};

export default CameraCaptureControls;
