
import { useState, useEffect } from 'react';

interface AppState {
  activeTab: string;
  currentStrainId: string | null;
  lastVisited: number;
}

const APP_STATE_KEY = 'doobie-app-state';

export const useAppState = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(APP_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if less than 24 hours old
        if (Date.now() - parsed.lastVisited < 24 * 60 * 60 * 1000) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load app state:', error);
    }
    return {
      activeTab: 'showcase',
      currentStrainId: null,
      lastVisited: Date.now()
    };
  });

  const updateAppState = (updates: Partial<Omit<AppState, 'lastVisited'>>) => {
    const newState = {
      ...appState,
      ...updates,
      lastVisited: Date.now()
    };
    setAppState(newState);
    
    try {
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save app state:', error);
    }
  };

  return {
    appState,
    updateAppState
  };
};
