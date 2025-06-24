import { useState, useCallback, useRef } from 'react';

interface ScanActivity {
  timestamp: number;
  type: 'scan' | 'generation';
}

export const useUserActivity = () => {
  const activityRef = useRef<ScanActivity[]>([]);

  const recordActivity = useCallback((type: 'scan' | 'generation') => {
    const now = Date.now();
    activityRef.current.push({ timestamp: now, type });
    
    // Keep only activities from the last 5 minutes
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    activityRef.current = activityRef.current.filter(
      activity => activity.timestamp > fiveMinutesAgo
    );
  }, []);

  const getRecentActivity = useCallback((minutes: number = 5) => {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return activityRef.current.filter(activity => activity.timestamp > cutoff);
  }, []);

  // No more artificial delays - always return 0
  const shouldSkipDelay = useCallback(() => true, []);

  const getOptimalDelay = useCallback(() => 0, []);

  return {
    recordActivity,
    getRecentActivity,
    shouldSkipDelay,
    getOptimalDelay
  };
};
