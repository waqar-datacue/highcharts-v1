
import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

export type VisualizationType = "line" | "bar" | "pie" | "step" | "table";

interface DashboardLayout {
  [key: string]: Array<{
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    maxW?: number;
  }>;
}

interface DashboardState {
  userWidgets: string[];
  layouts: DashboardLayout;
  filters: {
    storeTypes: string[];
    locationZones: string[];
    timePeriod: string;
    dateRange: {
      from: Date | undefined;
      to: Date | undefined;
    };
  };
  version: number;
}

const STORAGE_KEY = 'performance-dashboard-state';
const CURRENT_VERSION = 1;

const defaultState: DashboardState = {
  userWidgets: ["sales-by-store-chart", "sales-distribution-chart"],
  layouts: {},
  filters: {
    storeTypes: ["All"],
    locationZones: ["All"], 
    timePeriod: "Weekly",
    dateRange: {
      from: undefined,
      to: undefined
    }
  },
  version: CURRENT_VERSION
};

export const usePersistedDashboard = () => {
  const [dashboardState, setDashboardState] = useState<DashboardState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState) as DashboardState;
        
        // Version check and migration if needed
        if (parsed.version === CURRENT_VERSION) {
          // Convert date strings back to Date objects
          if (parsed.filters.dateRange.from) {
            parsed.filters.dateRange.from = new Date(parsed.filters.dateRange.from);
          }
          if (parsed.filters.dateRange.to) {
            parsed.filters.dateRange.to = new Date(parsed.filters.dateRange.to);
          }
          
          setDashboardState(parsed);
        } else {
          // Migration logic for version changes would go here
          console.log('Dashboard state version mismatch, using defaults');
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard state:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Debounced save function to avoid excessive localStorage writes
  const debouncedSave = useCallback(
    debounce((state: DashboardState) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        console.log('Dashboard state saved');
      } catch (error) {
        console.error('Failed to save dashboard state:', error);
      }
    }, 500),
    []
  );

  // Save state whenever it changes (after initial load)
  useEffect(() => {
    if (isLoaded) {
      debouncedSave(dashboardState);
    }
  }, [dashboardState, isLoaded, debouncedSave]);

  const updateUserWidgets = useCallback((widgets: string[]) => {
    setDashboardState(prev => ({
      ...prev,
      userWidgets: widgets
    }));
  }, []);

  const updateLayouts = useCallback((layouts: DashboardLayout) => {
    setDashboardState(prev => ({
      ...prev,
      layouts
    }));
  }, []);

  const updateFilters = useCallback((filters: Partial<DashboardState['filters']>) => {
    setDashboardState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...filters
      }
    }));
  }, []);

  const resetToDefault = useCallback(() => {
    setDashboardState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
    console.log('Dashboard reset to default');
  }, []);

  return {
    dashboardState,
    isLoaded,
    updateUserWidgets,
    updateLayouts,
    updateFilters,
    resetToDefault
  };
};
