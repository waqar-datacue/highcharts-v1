import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

export type Zone = "All" | "North Riyadh" | "South Riyadh" | "East Riyadh" | "West Riyadh" | "Central Riyadh";
export type Brand = "Coca-Cola" | "Pepsi" | "Local Brands" | "Premium Brands" | "All";
export type TimePeriod = "Weekly" | "Monthly" | "Daily" | "Custom";

interface HighchartsState {
  filters: {
    selectedZone: Zone;
    selectedBrand: Brand;
    selectedTimePeriod: TimePeriod;
    customDateRange: {
      from: Date;
      to: Date;
      isOpen: boolean;
    };
  };
  chartTypes: {
    sales: 'stackedBar' | 'groupedBar' | 'areaChart';
    price: 'line' | 'spline' | 'column';
  };
  widgets: string[];
  isLoading: boolean;
  version: number;
}

const STORAGE_KEY = 'highcharts-performance-state';
const CURRENT_VERSION = 1;

const defaultState: HighchartsState = {
  filters: {
    selectedZone: "All",
    selectedBrand: "All",
    selectedTimePeriod: "Monthly",
    customDateRange: {
      from: new Date(new Date().setDate(new Date().getDate() - 30)),
      to: new Date(),
      isOpen: false
    }
  },
  chartTypes: {
    sales: 'stackedBar',
    price: 'line'
  },
  widgets: ["sales-chart", "price-chart"],
  isLoading: false,
  version: CURRENT_VERSION
};

export const usePersistedHighchartsState = () => {
  const [state, setState] = useState<HighchartsState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState) as HighchartsState;
        
        if (parsed.version === CURRENT_VERSION) {
          // Convert date strings back to Date objects
          if (parsed.filters.customDateRange?.from) {
            parsed.filters.customDateRange.from = new Date(parsed.filters.customDateRange.from);
          }
          if (parsed.filters.customDateRange?.to) {
            parsed.filters.customDateRange.to = new Date(parsed.filters.customDateRange.to);
          }
          
          setState(parsed);
          console.log('Highcharts state loaded from localStorage');
        } else {
          console.log('Highcharts state version mismatch, using defaults');
        }
      }
    } catch (error) {
      console.error('Failed to load highcharts state:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Debounced save function to avoid excessive localStorage writes
  const debouncedSave = useCallback(
    debounce((state: HighchartsState) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        console.log('Highcharts state saved to localStorage');
      } catch (error) {
        console.error('Failed to save highcharts state:', error);
      }
    }, 500),
    []
  );

  // Save state whenever it changes (after initial load)
  useEffect(() => {
    if (isLoaded) {
      debouncedSave(state);
    }
  }, [state, isLoaded, debouncedSave]);

  const updateFilters = useCallback((filters: Partial<HighchartsState['filters']>) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...filters
      }
    }));
  }, []);

  const updateChartTypes = useCallback((chartTypes: Partial<HighchartsState['chartTypes']>) => {
    setState(prev => ({
      ...prev,
      chartTypes: {
        ...prev.chartTypes,
        ...chartTypes
      }
    }));
  }, []);

  const updateWidgets = useCallback((widgets: string[]) => {
    setState(prev => ({
      ...prev,
      widgets
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading
    }));
  }, []);

  const resetToDefault = useCallback(() => {
    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
    console.log('Highcharts state reset to default');
  }, []);

  return {
    state,
    isLoaded,
    updateFilters,
    updateChartTypes,
    updateWidgets,
    setLoading,
    resetToDefault
  };
}; 