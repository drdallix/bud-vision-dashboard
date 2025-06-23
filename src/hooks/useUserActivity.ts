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

  const shouldSkipDelay = useCallback(() => {
    const recentScans = getRecentActivity(5).filter(a => a.type === 'scan');
    return recentScans.length >= 2;
  }, [getRecentActivity]);

  const getOptimalDelay = useCallback(() => {
    if (shouldSkipDelay()) {
      return 0; // No delay for active users
    }
    
    const recentActivity = getRecentActivity(5);
    if (recentActivity.length === 0) {
      return 125; // Maximum delay for first-time users
    }
    
    // Reduce delay based on activity (25ms to 125ms range)
    const activityFactor = Math.min(recentActivity.length / 5, 1);
    return Math.round(125 - (activityFactor * 100) + 25);
  }, [shouldSkipDelay, getRecentActivity]);

  return {
    recordActivity,
    getRecentActivity,
    shouldSkipDelay,
    getOptimalDelay
  };
};
