
import { Strain } from '@/types/strain';
import FullscreenShowcaseSlide from '../FullscreenShowcaseSlide';
import FullscreenControls from '../FullscreenControls';
import { TransitionMode } from '../FullscreenTransitions';

interface FullscreenViewProps {
  currentStrain: Strain;
  currentIndex: number;
  transitionMode: TransitionMode;
  onExitFullscreen: () => void;
  filteredStrains: Strain[];
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
  onNavigateToIndex: (index: number) => void;
  setTransitionMode: (mode: TransitionMode) => void;
}

const FullscreenView = ({ 
  currentStrain, 
  currentIndex, 
  transitionMode, 
  onExitFullscreen,
  filteredStrains,
  isPlaying,
  setIsPlaying,
  onNext,
  onPrevious,
  onNavigateToIndex,
  setTransitionMode
}: FullscreenViewProps) => {
  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Main fullscreen slide */}
      <div className="absolute inset-0">
        <FullscreenShowcaseSlide
          strain={currentStrain}
          isActive={true}
          index={currentIndex}
          transitionMode={transitionMode}
        />
      </div>

      {/* Exit button - always visible */}
      <button
        onClick={onExitFullscreen}
        className="fixed top-6 right-6 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 z-50 transition-colors backdrop-blur-sm"
        aria-label="Exit fullscreen"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Fullscreen controls */}
      <FullscreenControls
        total={filteredStrains.length}
        current={currentIndex}
        paused={!isPlaying}
        slideInterval={5000}
        setPaused={(paused) => setIsPlaying(!paused)}
        setSlideInterval={() => {}} // Not implemented yet
        onNav={onNavigateToIndex}
        currentStrain={currentStrain}
        transitionMode={transitionMode}
        setTransitionMode={setTransitionMode}
        shuffleTransitions={false}
        setShuffleTransitions={() => {}} // Not implemented yet
        shuffleMode={false}
        setShuffleMode={() => {}} // Not implemented yet
      />
    </div>
  );
};

export default FullscreenView;
