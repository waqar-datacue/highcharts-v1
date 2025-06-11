import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import i18n from "i18next";
import { convertLanguageTypeToCode, convertLanguageCodeToType } from "../i18n";

// Types
export type StoreType = "Convenience" | "Supermarket" | "Hypermarket" | "Mini-Mart" | "Grocery" | "All";
export type LocationZone = "North Riyadh" | "South Riyadh" | "East Riyadh" | "West Riyadh" | "Central Riyadh" | "All";
export type TimePeriod = "Daily" | "Weekly" | "Monthly" | "Custom";
export type Language = "EN" | "AR";
export type DataQuality = "good" | "warning" | "error";

interface FilterState {
  storeTypes: StoreType[];
  locationZones: LocationZone[];
  timePeriod: TimePeriod;
  dateRange: {
    start: Date;
    end: Date;
  };
  language: Language;
}

interface DataContextType {
  filters: FilterState;
  setStoreTypes: (types: StoreType[]) => void;
  setLocationZones: (zones: LocationZone[]) => void;
  setTimePeriod: (period: TimePeriod) => void;
  setDateRange: (start: Date, end: Date) => void;
  setLanguage: (lang: Language) => void;
  isLoading: boolean;
  refreshData: () => void;
  dataQuality: DataQuality;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper to get date ranges
const getDateRangeForTimePeriod = (period: TimePeriod): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();
  
  switch (period) {
    case "Daily":
      start.setDate(end.getDate() - 1);
      break;
    case "Weekly":
      start.setDate(end.getDate() - 7);
      break;
    case "Monthly":
      start.setMonth(end.getMonth() - 1);
      break;
    case "Custom":
      // Custom dates handled separately
      break;
  }
  
  return { start, end };
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [dataQuality, setDataQuality] = useState<DataQuality>("good");
  
  // Initialize filters with defaults
  const [filters, setFilters] = useState<FilterState>({
    storeTypes: ["All"],
    locationZones: ["All"],
    timePeriod: "Weekly",
    dateRange: getDateRangeForTimePeriod("Weekly"),
    language: convertLanguageCodeToType(i18n.language), // Initialize from i18n
  });

  // Update i18n language when the component mounts
  useEffect(() => {
    // Set i18n language from the initial filters.language value
    i18n.changeLanguage(convertLanguageTypeToCode(filters.language));
    
    // Update document direction based on the language
    document.documentElement.dir = filters.language === "AR" ? "rtl" : "ltr";
  }, []);

  // Filter update handlers
  const setStoreTypes = (types: StoreType[]) => {
    setFilters(prev => ({ ...prev, storeTypes: types }));
    refreshData();
  };

  const setLocationZones = (zones: LocationZone[]) => {
    setFilters(prev => ({ ...prev, locationZones: zones }));
    refreshData();
  };

  const setTimePeriod = (period: TimePeriod) => {
    const dateRange = getDateRangeForTimePeriod(period);
    setFilters(prev => ({ ...prev, timePeriod: period, dateRange }));
    refreshData();
  };

  const setDateRange = (start: Date, end: Date) => {
    setFilters(prev => ({ 
      ...prev, 
      timePeriod: "Custom", 
      dateRange: { start, end } 
    }));
    refreshData();
  };

  const setLanguage = (lang: Language) => {
    setFilters(prev => ({ ...prev, language: lang }));
    
    // Change i18n language
    i18n.changeLanguage(convertLanguageTypeToCode(lang));
    
    // Update document direction
    document.documentElement.dir = lang === "AR" ? "rtl" : "ltr";
    
    // Show toast in the new language (will use the new translations)
    setTimeout(() => {
      toast.info(i18n.t('common.info') + ': ' + i18n.t('header.language_switch'));
    }, 100);
  };
  
  // Function to refresh data after filter changes
  const refreshData = () => {
    setIsLoading(true);
    // In a real app, we'd fetch data based on current filters
    toast.info("Updating data based on your filter selection");
    
    // Simulate data quality check
    const qualityCheck = Math.random();
    if (qualityCheck < 0.1) {
      setDataQuality("error");
    } else if (qualityCheck < 0.3) {
      setDataQuality("warning");
    } else {
      setDataQuality("good");
    }
    
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  // Effect to fetch initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      // In a real app, we'd fetch initial data based on default filters
      setTimeout(() => {
        setIsLoading(false);
        toast.success("Data loaded successfully");
      }, 1000);
    }
  }, [isAuthenticated]);

  return (
    <DataContext.Provider
      value={{
        filters,
        setStoreTypes,
        setLocationZones,
        setTimePeriod,
        setDateRange,
        setLanguage,
        isLoading,
        refreshData,
        dataQuality,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};
