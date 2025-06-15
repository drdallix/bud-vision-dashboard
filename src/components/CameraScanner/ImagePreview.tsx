
import { Camera, Scan } from 'lucide-react';

interface ImagePreviewProps {
  selectedImage: string | null;
  isScanning: boolean;
}

const ImagePreview = ({ selectedImage, isScanning }: ImagePreviewProps) => {
  return (
    <div className="relative">
      <div className={`aspect-video bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center ${isScanning ? 'scan-animation' : ''}`}>
        {selectedImage ? (
          <img 
            src={selectedImage} 
            alt="Cannabis package to scan" 
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-center space-y-4">
            <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No package image selected</p>
            <p className="text-sm text-muted-foreground">
              Capture or upload a cannabis package image
            </p>
          </div>
        )}
      </div>
      
      {isScanning && (
        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
          <div className="text-center text-white space-y-2">
            <Scan className="h-8 w-8 animate-spin mx-auto" />
            <p className="font-medium">DoobieDB Analyzing Package...</p>
            <p className="text-sm opacity-80">Reading strain information and lab results</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
