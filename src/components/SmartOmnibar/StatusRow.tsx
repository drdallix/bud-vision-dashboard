
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface StatusRowProps {
  uploadedImage: string | null;
  searchTerm: string;
  isGenerating: boolean;
  hasUser: boolean;
  onClearImage: () => void;
}

const StatusRow = ({
  uploadedImage,
  searchTerm,
  isGenerating,
  hasUser,
  onClearImage
}: StatusRowProps) => {
  const showHint = searchTerm.trim().length > 0 && !isGenerating;
  const shouldShow = (uploadedImage || showHint || !hasUser) && !isGenerating;
  
  if (!shouldShow) return null;

  return (
    <div className="flex items-center justify-between min-h-[24px]">
      <div className="flex items-center gap-2">
        {uploadedImage && (
          <div className="relative inline-block">
            <img 
              src={uploadedImage} 
              alt="Package" 
              className="w-6 h-6 object-cover rounded border"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-1 -right-1 h-3 w-3 rounded-full p-0"
              onClick={onClearImage}
            >
              <X className="h-2 w-2" />
            </Button>
          </div>
        )}
        
        {showHint && (
          <div className="text-xs text-green-600">
            💡 Press AI to analyze "{searchTerm}"
          </div>
        )}
      </div>

      {!hasUser && (
        <Badge variant="outline" className="text-xs">
          Sign in to use AI
        </Badge>
      )}
    </div>
  );
};

export default StatusRow;
