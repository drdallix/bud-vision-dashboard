
import { useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  selectedImage: string | null;
  onImageSelect: (imageUrl: string) => void;
  onImageClear: () => void;
  disabled?: boolean;
}

const ImageUpload = ({ selectedImage, onImageSelect, onImageClear, disabled = false }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onImageSelect(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
        disabled={disabled}
      >
        <Camera className="h-4 w-4" />
      </Button>

      {/* Image preview */}
      {selectedImage && (
        <div className="absolute top-full left-0 right-0 mt-2">
          <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
            <img 
              src={selectedImage} 
              alt="Selected package" 
              className="w-10 h-10 object-cover rounded"
            />
            <span className="text-sm text-muted-foreground flex-1">Package image selected</span>
            <Button
              onClick={onImageClear}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        className="hidden"
      />
    </>
  );
};

export default ImageUpload;
