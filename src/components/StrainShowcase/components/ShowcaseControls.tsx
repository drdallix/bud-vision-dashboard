
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, Maximize } from 'lucide-react';

interface ShowcaseControlsProps {
  currentIndex: number;
  totalStrains: number;
  isPlaying: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onPlayPause: () => void;
  onFullscreen: () => void;
  showPlayback: boolean;
}

const ShowcaseControls = ({
  currentIndex,
  totalStrains,
  isPlaying,
  onNext,
  onPrevious,
  onPlayPause,
  onFullscreen,
  showPlayback,
}: ShowcaseControlsProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={totalStrains <= 1}
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          {showPlayback && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPlayPause}
              disabled={totalStrains <= 1}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={totalStrains <= 1}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} of {totalStrains}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onFullscreen}
          disabled={totalStrains === 0}
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default ShowcaseControls;
