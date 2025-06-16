
import { Strain } from '@/types/strain';
import FullscreenShowcaseSlide from '../FullscreenShowcaseSlide';
import { TransitionMode } from '../FullscreenTransitions';

interface FullscreenViewProps {
  currentStrain: Strain;
  currentIndex: number;
  transitionMode: TransitionMode;
  onExitFullscreen: () => void;
}

const FullscreenView = ({ 
  currentStrain, 
  currentIndex, 
  transitionMode, 
  onExitFullscreen 
}: FullscreenViewProps) => {
  return (
    <div className="fixed inset-0 bg-black z-50">
      <FullscreenShowcaseSlide
        strain={currentStrain}
        isActive={true}
        index={currentIndex}
        transitionMode={transitionMode}
      />
      <button
        onClick={onExitFullscreen}
        className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 z-10 transition-colors"
        aria-label="Exit fullscreen"
      >
        ✕
      </button>
    </div>
  );
};

export default FullscreenView;
