
import { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FullscreenButtonProps {
  isFullscreen?: boolean;
  onToggle?: () => void;
}

const FullscreenButton = ({ isFullscreen: propIsFullscreen, onToggle }: FullscreenButtonProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
      
      // Call the onToggle callback if provided
      if (onToggle) {
        onToggle();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  // Use prop value if provided, otherwise use state
  const currentFullscreenState = propIsFullscreen !== undefined ? propIsFullscreen : isFullscreen;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={currentFullscreenState ? "Exit fullscreen" : "Enter fullscreen"}
      onClick={toggleFullscreen}
      className="bg-violet-900 hover:bg-violet-800"
    >
      {currentFullscreenState ? (
        <Minimize className="h-4 w-4" />
      ) : (
        <Maximize className="h-4 w-4" />
      )}
    </Button>
  );
};

export default FullscreenButton;
