
import { Pause, Play, ArrowLeft, ArrowRight, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShowcaseControlsProps {
  total: number;
  current: number;
  paused: boolean;
  setPaused: (val: boolean) => void;
  onNav: (step: number) => void;
}

const ShowcaseControls = ({
  total, current, paused, setPaused, onNav,
}: ShowcaseControlsProps) => {
  return (
    <div className="absolute left-0 right-0 bottom-6 flex items-center justify-center gap-4">
      <Button variant="ghost" size="icon" aria-label="Previous" onClick={() => onNav(current === 0 ? total - 1 : current - 1)}>
        <ArrowLeft />
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label={paused ? "Play" : "Pause"}
        onClick={() => setPaused(!paused)}
      >
        {paused ? <Play /> : <Pause />}
      </Button>
      <Button variant="ghost" size="icon" aria-label="Next" onClick={() => onNav((current + 1) % total)}>
        <ArrowRight />
      </Button>
    </div>
  );
};
export default ShowcaseControls;
