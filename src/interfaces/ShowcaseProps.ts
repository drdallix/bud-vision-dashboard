
import { Strain } from '@/types/strain';
import { ShowcaseState, ShowcaseSettings } from '@/core/ShowcaseController';
import { FilterCriteria } from '@/core/FilterEngine';

export interface ShowcaseCarouselProps {
  strains: Strain[];
  state: ShowcaseState;
  settings: ShowcaseSettings;
  onStateChange: (state: ShowcaseState) => void;
  onStrainSelect: (strain: Strain) => void;
}

export interface ShowcaseControlsProps {
  state: ShowcaseState;
  totalStrains: number;
  onNext: () => void;
  onPrevious: () => void;
  onTogglePlayback: () => void;
  onToggleFullscreen: () => void;
  onGoToIndex: (index: number) => void;
}

export interface ShowcaseFiltersProps {
  criteria: FilterCriteria;
  onCriteriaChange: (criteria: FilterCriteria) => void;
  availableOptions: {
    types: string[];
    effects: string[];
    flavors: string[];
    thcRange: [number, number];
  };
}

export interface ShowcaseSlideProps {
  strain: Strain;
  settings: ShowcaseSettings;
  isActive: boolean;
  onClick: () => void;
}
