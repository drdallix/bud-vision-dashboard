import React, { useState, useEffect, useCallback } from 'react';
import { Strain } from '@/types/strain';
import { ShowcaseFilters } from './ShowcaseFilters';
import { ShowcaseSlide } from './ShowcaseSlide';
import { ShowcaseControls } from './ShowcaseControls';
import { ShowcaseProgress } from './ShowcaseProgress';
import { FullscreenSceneManager } from './FullscreenSceneManager';
import { FullscreenControls } from './FullscreenControls';
import { FullscreenButton } from './FullscreenButton';
import { TransitionMode } from './FullscreenTransitions';

const StrainShowcase = () => {
  const [strains, setStrains] = useState<Strain[]>([]);
  const [filteredStrains, setFilteredStrains] = useState<Strain[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [slideInterval, setSlideInterval] = useState(5000);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [transitionMode, setTransitionMode] = useState<TransitionMode>('elegant');
  const [shuffleTransitions, setShuffleTransitions] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    const mockStrains: Strain[] = [
      { id: '1', name: 'Northern Lights', type: 'Indica', thc: 20, cbd: 1, scannedAt: new Date(), effectProfiles: [], inStock: true, userId: '' },
      { id: '2', name: 'Sour Diesel', type: 'Sativa', thc: 22, cbd: 0, scannedAt: new Date(), effectProfiles: [], inStock: true, userId: '' },
      { id: '3', name: 'Blue Dream', type: 'Hybrid', thc: 19, cbd: 2, scannedAt: new Date(), effectProfiles: [], inStock: true, userId: '' },
    ];
    setStrains(mockStrains);
    setFilteredStrains(mockStrains);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (!paused && !isFullscreen) {
      intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredStrains.length);
      }, slideInterval);
    }

    return () => clearInterval(intervalId);
  }, [paused, slideInterval, filteredStrains.length, isFullscreen]);

  useEffect(() => {
    // Apply filters and sorting
    let results = [...strains];

    if (searchTerm) {
      results = results.filter(strain =>
        strain.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      results = results.filter(strain => strain.type === typeFilter);
    }

    if (sortBy === 'name') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'thc') {
      results.sort((a, b) => b.thc - a.thc);
    }

    setFilteredStrains(results);
    setCurrentIndex(0); // Reset index when filters change
  }, [strains, searchTerm, typeFilter, sortBy]);

  const handleNavigation = (index: number) => {
    setCurrentIndex(index);
  };

  const handleStrainClick = useCallback((strain: Strain) => {
    console.log('Strain clicked in showcase:', strain);
    // Navigate to strain details - this will be handled by the parent Index component
    // We can trigger a custom event or use a callback passed from parent
    const event = new CustomEvent('strainSelected', { detail: strain });
    window.dispatchEvent(event);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {!isFullscreen && (
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Strain Showcase
              <span className="ml-2">🌿</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover premium cannabis strains from our curated collection. Each strain is carefully selected for quality and unique characteristics.
            </p>
          </div>

          <ShowcaseFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              {filteredStrains.length > 0 ? (
                <ShowcaseSlide 
                  strain={filteredStrains[currentIndex]} 
                  onStrainClick={handleStrainClick}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No strains match your current filters</p>
                </div>
              )}
            </div>

            <div className="lg:w-80">
              {filteredStrains.length > 0 && (
                <ShowcaseControls
                  total={filteredStrains.length}
                  current={currentIndex}
                  paused={paused}
                  slideInterval={slideInterval}
                  setPaused={setPaused}
                  setSlideInterval={setSlideInterval}
                  onNav={handleNavigation}
                  currentStrain={filteredStrains[currentIndex]}
                />
              )}
            </div>
          </div>

          <ShowcaseProgress 
            total={filteredStrains.length}
            current={currentIndex}
            onNav={handleNavigation}
          />
        </div>
      )}

      {isFullscreen && filteredStrains.length > 0 && (
        <FullscreenSceneManager
          strains={filteredStrains}
          currentIndex={currentIndex}
          transitionMode={transitionMode}
          onStrainClick={handleStrainClick}
        />
      )}

      {isFullscreen && filteredStrains.length > 0 && (
        <FullscreenControls
          total={filteredStrains.length}
          current={currentIndex}
          paused={paused}
          slideInterval={slideInterval}
          setPaused={setPaused}
          setSlideInterval={setSlideInterval}
          onNav={handleNavigation}
          currentStrain={filteredStrains[currentIndex]}
          transitionMode={transitionMode}
          setTransitionMode={setTransitionMode}
          shuffleTransitions={shuffleTransitions}
          setShuffleTransitions={setShuffleTransitions}
          shuffleMode={shuffleMode}
          setShuffleMode={setShuffleMode}
          onStrainClick={handleStrainClick}
        />
      )}

      <FullscreenButton 
        isFullscreen={isFullscreen} 
        onToggle={() => setIsFullscreen(!isFullscreen)} 
      />
    </div>
  );
};

export default StrainShowcase;
