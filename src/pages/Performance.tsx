import React, { useState, useEffect, useRef } from "react";
import Widget from "../components/widgets/Widget";
import { MetricWidget } from '@/components/widgets/MetricWidget';
import ChartWidget from "../components/widgets/ChartWidget";
import { HeatmapWidget } from '../components/widgets/HeatmapWidget';
import DataTableWidget from '../components/widgets/DataTableWidget';
import { useDataContext, StoreType, LocationZone, TimePeriod } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import { usePersistedDashboard } from "../hooks/usePersistedDashboard";
import { 
  Plus, 
  X, 
  BarChart, 
  PieChart, 
  LineChart, 
  Table,
  Activity,
  ShoppingCart,
  Users,
  Store,
  AlertTriangle,
  TrendingUp,
  Map,
  Filter,
  Calendar as CalendarIcon,
  Check,
  RotateCcw
} from "lucide-react";
import { Responsive, WidthProvider } from "react-grid-layout";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useToast } from "@/components/ui/use-toast";
import { useAI } from "@/contexts/AIContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; 
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Create a responsive grid layout
const ResponsiveGridLayout = WidthProvider(Responsive);

// Mock data for demonstration purposes
const priceData = [
  { name: "Week 1", value: 4.50 },
  { name: "Week 2", value: 4.75 },
  { name: "Week 3", value: 4.65 },
  { name: "Week 4", value: 4.90 },
  { name: "This Week", value: 5.10 },
];

const customerData = [
  { name: "Week 1", value: 24500 },
  { name: "Week 2", value: 22800 },
  { name: "Week 3", value: 27300 },
  { name: "Week 4", value: 28900 },
  { name: "This Week", value: 31250 },
];

// Data from Custom Dashboard
const salesByStoreTypeData = [
  { name: "Hypermarket", value: 1250000 },
  { name: "Supermarket", value: 850000 },
  { name: "Convenience", value: 450000 },
];

const salesDistributionData = [
  { name: "North Riyadh", value: 850000 },
  { name: "South Riyadh", value: 650000 },
  { name: "East Riyadh", value: 450000 },
  { name: "West Riyadh", value: 350000 },
  { name: "Central Riyadh", value: 250000 },
];

const customTopSkusData = [
  { sku: "COLA-330ML", name: "Cola 330ml", sales: 125000, units: 45000, share: 15.5 },
  { sku: "WATER-500ML", name: "Water 500ml", sales: 98000, units: 65000, share: 12.2 },
  { sku: "JUICE-1L", name: "Orange Juice 1L", sales: 85000, units: 28000, share: 10.5 },
  { sku: "ENERGY-250ML", name: "Energy Drink 250ml", sales: 75000, units: 32000, share: 9.3 },
  { sku: "TEA-500ML", name: "Iced Tea 500ml", sales: 65000, units: 25000, share: 8.1 },
];

// Add sample sales data for Riyadh locations with more realistic distribution
const riyadhSalesData: Array<{ location: [number, number]; value: number }> = [
  // Central Business District
  { location: [46.6753, 24.7136], value: 2500000 }, // King Fahd Road
  { location: [46.6833, 24.6500], value: 2200000 }, // Olaya
  { location: [46.7000, 24.6500], value: 1800000 }, // Tahlia
  { location: [46.6500, 24.7000], value: 1500000 }, // Malaz
  
  // North Riyadh
  { location: [46.7500, 24.7500], value: 1200000 }, // Al Nakheel
  { location: [46.7800, 24.7800], value: 900000 },  // Al Hamra
  { location: [46.7200, 24.7200], value: 1100000 }, // Al Rabwa
  { location: [46.6800, 24.7800], value: 800000 },  // Al Wurud
  
  // East Riyadh
  { location: [46.8000, 24.6500], value: 1300000 }, // Al Olaya
  { location: [46.8500, 24.6800], value: 950000 },  // Al Malaz
  { location: [46.8200, 24.6200], value: 850000 },  // Al Murabba
  { location: [46.7800, 24.5800], value: 750000 },  // Al Sulaymaniyah
  
  // South Riyadh
  { location: [46.6500, 24.5800], value: 1400000 }, // Al Malaz
  { location: [46.6000, 24.6200], value: 1000000 }, // Al Wurud
  { location: [46.5500, 24.6500], value: 850000 },  // Al Rabwa
  { location: [46.5000, 24.6800], value: 700000 },  // Al Sulaymaniyah
  
  // West Riyadh
  { location: [46.5800, 24.7500], value: 1600000 }, // Al Olaya
  { location: [46.5500, 24.7800], value: 1200000 }, // Al Malaz
  { location: [46.5200, 24.7200], value: 950000 },  // Al Wurud
  { location: [46.5000, 24.6500], value: 800000 },  // Al Rabwa
  
  // Additional points for better coverage
  { location: [46.7200, 24.5800], value: 1100000 }, // Al Sulaymaniyah
  { location: [46.6800, 24.6200], value: 1300000 }, // Al Olaya
  { location: [46.6500, 24.7800], value: 900000 },  // Al Malaz
  { location: [46.6200, 24.7200], value: 750000 },  // Al Wurud
];

// Add sample data for Top SKUs


const topSkusData = [
  { sku: 'SKU001', name: 'Product A', sales: 1250000, volume: 25000, share: 15 },
  { sku: 'SKU002', name: 'Product B', sales: 980000, volume: 19600, share: 12 },
  { sku: 'SKU003', name: 'Product C', sales: 850000, volume: 17000, share: 10 },
  { sku: 'SKU004', name: 'Product D', sales: 720000, volume: 14400, share: 9 },
  { sku: 'SKU005', name: 'Product E', sales: 650000, volume: 13000, share: 8 }
];

type VisualizationType = "line" | "bar" | "pie" | "step" | "table";

const topSkusColumns = [
  { key: 'sku', label: 'SKU' },
  { key: 'name', label: 'Product Name' },
  { key: 'sales', label: 'Sales', isCurrency: true },
  { key: 'volume', label: 'Volume' },
  { key: 'share', label: 'Share', format: (value: number) => `${value}%` }
];

const storeSalesColumns = [
  { key: 'store', label: 'Store' },
  { key: 'location', label: 'Location' },
  { key: 'sales', label: 'Sales', isCurrency: true },
  { key: 'volume', label: 'Volume' },
  { key: 'share', label: 'Share', format: (value: number) => `${value}%` }
];

const Performance: React.FC = () => {
  const { 
    filters, 
    setStoreTypes, 
    setLocationZones, 
    setTimePeriod,
    setDateRange
  } = useDataContext();
  const { user } = useAuth();
  const { openAITray } = useAI();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [priceChartType, setPriceChartType] = useState<VisualizationType>("step");
  const [customerChartType, setCustomerChartType] = useState<VisualizationType>("line");
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Use persisted dashboard hook
  const {
    dashboardState,
    isLoaded,
    updateUserWidgets,
    updateLayouts,
    updateFilters,
    resetToDefault
  } = usePersistedDashboard();

  // Extract values from dashboard state
  const userWidgets = dashboardState.userWidgets;
  const layouts = dashboardState.layouts;
  
  // Date range state - sync with persisted state
  const [dateRange, setDateRangeState] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: dashboardState.filters.dateRange.from || filters.dateRange.start,
    to: dashboardState.filters.dateRange.to || filters.dateRange.end
  });

  // Filter options
  const storeTypes: StoreType[] = ["All", "Hypermarket", "Supermarket", "Convenience"];
  const locationZones: LocationZone[] = ["All", "North Riyadh", "South Riyadh", "East Riyadh", "West Riyadh", "Central Riyadh"];
  const timePeriods: TimePeriod[] = ["Daily", "Weekly", "Monthly", "Custom"];

  // Helper function to format values based on locale
  const getAdjustedValue = (value: number): string => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Handler functions for filters - now save to persisted state
  const handleStoreTypeChange = (value: string) => {
    const newStoreTypes = value === "All" ? ["All"] : [value];
    updateFilters({ storeTypes: newStoreTypes });
    console.log('Store type changed:', value);
  };

  const handleLocationChange = (value: string) => {
    const newLocationZones = value === "All" ? ["All"] : [value];
    updateFilters({ locationZones: newLocationZones });
    console.log('Location changed:', value);
  };

  const handleTimePeriodChange = (value: string) => {
    updateFilters({ timePeriod: value });
    console.log('Time period changed:', value);
  };

  const handleDateRangeSelect = (range: { from: Date; to: Date }) => {
    setDateRangeState(range);
    updateFilters({ dateRange: range });
    console.log('Date range selected:', range);
  };

  // Generate layout for widgets
  const generateLayouts = () => {
    // Calculate positions for widgets based on their sizes
    const lgLayout = [];
    const mdLayout = [];
    const smLayout = [];
    
    let lgY = 0;
    let lgX = 0;
    let mdY = 0;
    let mdX = 0;
    let smY = 0;
    
    // Process wide widgets first to ensure they get full width
    const sortedWidgets = [...userWidgets].sort((a, b) => {
      const widgetA = availableWidgets.find(w => w.id === a);
      const widgetB = availableWidgets.find(w => w.id === b);
      return (widgetB?.isWide ? 1 : 0) - (widgetA?.isWide ? 1 : 0);
    });
    
    for (const widgetId of sortedWidgets) {
      const widget = availableWidgets.find(w => w.id === widgetId);
      if (!widget) continue;
      
      // Large screens (2 columns)
      const lgWidth = widget.isWide ? 2 : 1;
      const lgHeight = widget.height || 1;
      
      // Check if adding at current x position would exceed grid width
      if (lgX + lgWidth > 2) {
        lgX = 0;
        lgY += 2; // Move to next row
      }
      
      lgLayout.push({
        i: widgetId,
        x: lgX,
        y: lgY,
        w: lgWidth,
        h: lgHeight,
        minW: lgWidth,
        maxW: 2
      });
      
      lgX += lgWidth;
      if (lgX >= 2) {
        lgX = 0;
        lgY += lgHeight;
      }
      
      // Medium screens (2 columns)
      const mdWidth = widget.isWide ? 2 : 1;
      const mdHeight = widget.height || 1;
      
      if (mdX + mdWidth > 2) {
        mdX = 0;
        mdY += 2;
      }
      
      mdLayout.push({
        i: widgetId,
        x: mdX,
        y: mdY,
        w: mdWidth,
        h: mdHeight,
        minW: mdWidth,
        maxW: 2
      });
      
      mdX += mdWidth;
      if (mdX >= 2) {
        mdX = 0;
        mdY += mdHeight;
      }
      
      // Small screens (1 column)
      const smWidth = 1;  // All widgets take full width on small screens
      const smHeight = widget.isWide ? Math.max(2, widget.height || 2) : (widget.height || 1);
      
      smLayout.push({
        i: widgetId,
        x: 0,
        y: smY,
        w: smWidth,
        h: smHeight,
        minW: smWidth,
        maxW: 1
      });
      
      smY += smHeight;
    }
    
    return {
      lg: lgLayout,
      md: mdLayout,
      sm: smLayout
    };
  };
  
  // Update layouts when widgets change - now handled by the hook
  useEffect(() => {
    if (userWidgets.length > 0 && isLoaded) {
      updateLayouts(generateLayouts());
    }
  }, [userWidgets, isLoaded, updateLayouts]);
  
  // Handle opening/closing widget menu
  const toggleAddWidgetMenu = () => {
    setIsAddWidgetOpen(!isAddWidgetOpen);
  };

  // Toggle a widget (add if not present, remove if present) - now uses persisted state
  const toggleWidget = (widgetId: string) => {
    if (userWidgets.includes(widgetId)) {
      // Don't allow removing both default charts
      if ((widgetId === "sales-by-store-chart" || widgetId === "sales-distribution-chart") && 
          userWidgets.includes("sales-by-store-chart") && 
          userWidgets.includes("sales-distribution-chart") &&
          userWidgets.length === 2) {
        toast({
          title: "Cannot remove default widget",
          description: "You must keep at least one of the default widgets",
          variant: "destructive"
        });
        return; // Prevent removing last default chart
      }
      // Remove widget
      updateUserWidgets(userWidgets.filter(id => id !== widgetId));
    } else {
      // Add widget
      updateUserWidgets([...userWidgets, widgetId]);
    }
    // Close the menu after toggling widget
    setIsAddWidgetOpen(false);
  };

  // Handle layout change - now uses persisted state
  const handleLayoutChange = (currentLayout: any, allLayouts: any) => {
    updateLayouts(allLayouts);
  };

  // Available widgets for adding - now indexed from all widgets on the dashboard
  const availableWidgets = [
    { 
      id: "sales-value-metric", 
      name: t('performance.metrics.sales_value.title'), 
      icon: ShoppingCart, 
      description: t('performance.metrics.sales_value.description'),
      category: t('performance.categories.metrics'),
      width: 1,
      height: 1
    },
    { 
      id: "sales-volume-metric", 
      name: t('performance.metrics.sales_volume.title'), 
      icon: Activity, 
      description: t('performance.metrics.sales_volume.description'),
      category: t('performance.categories.metrics'),
      width: 1,
      height: 1
    },
    { 
      id: "customer-count-metric", 
      name: t('performance.metrics.customer_count.title'), 
      icon: Users, 
      description: t('performance.metrics.customer_count.description'),
      category: t('performance.categories.metrics'),
      width: 1,
      height: 1
    },
    { 
      id: "store-count-metric", 
      name: t('performance.metrics.store_count.title'), 
      icon: Store, 
      description: t('performance.metrics.store_count.description'),
      category: t('performance.categories.metrics'),
      width: 1,
      height: 1
    },
    { 
      id: "out-of-stock-metric", 
      name: t('performance.metrics.out_of_stock.title'), 
      icon: AlertTriangle, 
      description: t('performance.metrics.out_of_stock.description'),
      category: t('performance.categories.metrics'),
      width: 1,
      height: 1
    },
    { 
      id: "price-trend-chart", 
      name: t('performance.charts.price_trend.title'), 
      icon: LineChart, 
      description: t('performance.charts.price_trend.description'),
      category: t('performance.categories.charts'),
      width: 1,
      height: 2
    },
    { 
      id: "customer-trend-chart", 
      name: t('performance.charts.customer_trend.title'), 
      icon: LineChart, 
      description: t('performance.charts.customer_trend.description'),
      category: t('performance.categories.charts'),
      width: 1,
      height: 2
    },
    { 
      id: "sales-by-store-chart", 
      name: t('performance.charts.sales_by_store.title'), 
      icon: BarChart, 
      description: t('performance.charts.sales_by_store.description'),
      category: t('performance.categories.charts'),
      width: 1,
      height: 2
    },
    { 
      id: "sales-distribution-chart", 
      name: t('performance.charts.sales_distribution.title'), 
      icon: PieChart, 
      description: t('performance.charts.sales_distribution.description'),
      category: t('performance.categories.charts'),
      width: 1,
      height: 2
    },
    { 
      id: "top-skus-table", 
      name: t('performance.tables.top_skus.title'), 
      icon: Table, 
      description: t('performance.tables.top_skus.description'),
      category: t('performance.categories.tables'),
      isWide: true,
      width: 2,
      height: 2
    },
    { 
      id: "detailed-skus-table", 
      name: t('performance.tables.detailed_skus.title'), 
      icon: Table, 
      description: t('performance.tables.detailed_skus.description'),
      category: t('performance.categories.tables'),
      isWide: true,
      width: 2,
      height: 2
    },
    { 
      id: "riyadh-sales-heatmap", 
      name: t('performance.maps.riyadh_sales.title'), 
      icon: Map, 
      description: t('performance.maps.riyadh_sales.description'),
      category: t('performance.categories.maps'),
      isWide: false,
      width: 1,
      height: 2
    }
  ];
  
  // Group widgets by category for the dropdown menu
  const groupedWidgets = availableWidgets.reduce((acc: Record<string, typeof availableWidgets>, widget) => {
    const category = widget.category || t('performance.categories.other');
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(widget);
    return acc;
  }, {});
  
  // Update translations when language changes
  useEffect(() => {
    // Force re-render of widgets when language changes
    updateLayouts(generateLayouts());
  }, [i18n.language]);

  const addWidget = (widgetId: string) => {
    const defaultLayout = {
      i: widgetId,
      x: 0,
      y: 0,
      w: 6,
      h: 4
    };
    updateUserWidgets([...userWidgets, widgetId]);
    updateLayouts({
      ...layouts,
      lg: [...(layouts.lg || []), defaultLayout]
    });
  };

  // Render a user-added widget based on its ID
  const renderUserWidget = (widgetId: string) => {
    // Sales Value Metric
    if (widgetId === "sales-value-metric") {
      return (
        <Widget
          key={widgetId}
          id={widgetId}
          title={t('performance.metrics.sales_value.title')}
          category="Beverages"
          onRemove={() => toggleWidget(widgetId)}
          data={{ value: getAdjustedValue(2300000) }}
        >
          <MetricWidget
            title={t('performance.metrics.sales_value.title')}
            value={getAdjustedValue(2300000)}
            isCurrency={true}
            change={5.2}
          />
        </Widget>
      );
    }
    
    // Sales Volume Metric
    else if (widgetId === "sales-volume-metric") {
      return (
        <Widget
          key={widgetId}
          id={widgetId}
          title={t('performance.metrics.sales_volume.title')}
          category="Beverages"
          onRemove={() => toggleWidget(widgetId)}
          data={{ value: getAdjustedValue(120000) }}
        >
          <MetricWidget
            title={t('performance.metrics.sales_volume.title')}
            value={getAdjustedValue(120000)}
            change={3.2}
          />
        </Widget>
      );
    }
    
    // Customer Count Metric
    else if (widgetId === "customer-count-metric") {
      return (
        <Widget
          key={widgetId}
          id={widgetId}
          title={t('performance.metrics.customer_count.title')}
          category="Beverages"
          onRemove={() => toggleWidget(widgetId)}
          data={{ value: getAdjustedValue(12500) }}
        >
          <MetricWidget
            title={t('performance.metrics.customer_count.title')}
            value={getAdjustedValue(12500)}
          />
        </Widget>
      );
    }
    
    // Store Count Metric
    else if (widgetId === "store-count-metric") {
      return (
        <Widget
          key={widgetId}
          id={widgetId}
          title={t('performance.metrics.store_count.title')}
          category="Beverages"
          onRemove={() => toggleWidget(widgetId)}
          data={{ value: getAdjustedValue(1250) }}
        >
          <MetricWidget
            title={t('performance.metrics.store_count.title')}
            value={getAdjustedValue(1250)}
            change={2.5}
          />
        </Widget>
      );
    }
    
    // Out of Stock Percentage
    else if (widgetId === "out-of-stock-metric") {
      return (
        <Widget
          key={widgetId}
          id={widgetId}
          title={t('performance.metrics.out_of_stock.title')}
          category="Beverages"
          onRemove={() => toggleWidget(widgetId)}
          data={{ value: getAdjustedValue(8.5) }}
        >
          <MetricWidget
            title={t('performance.metrics.out_of_stock.title')}
            value={getAdjustedValue(8.5)}
            suffix="%"
            change={-1.2}
          />
        </Widget>
      );
    }
    
    // Price Trend Chart
    else if (widgetId === "price-trend-chart") {
      return (
        <Widget
          key={widgetId}
          id={widgetId}
          title={t('performance.charts.price_trend.title')}
          category="Beverages"
          allowChangeVisualization
          onRemove={() => toggleWidget(widgetId)}
        >
          <ChartWidget
            id="price-trend-chart"
            title={t('performance.charts.price_trend.title')}
            data={priceData}
            dataKey="value"
            initialChartType="line"
            isCurrency={true}
          />
        </Widget>
      );
    }
    
    // Customer Trend Chart
    else if (widgetId === "customer-trend-chart") {
      return (
        <Widget
          key={widgetId}
          id={widgetId}
          title={t('performance.charts.customer_trend.title')}
          category="Beverages"
          allowChangeVisualization
          onRemove={() => toggleWidget(widgetId)}
        >
          <ChartWidget
            id="customer-trend-chart"
            title={t('performance.charts.customer_trend.title')}
            data={customerData}
            dataKey="value"
            initialChartType="line"
          />
        </Widget>
      );
    }
    
    // Sales by Store Chart
    else if (widgetId === "sales-by-store-chart") {
      return (
        <Widget
          key={widgetId}
          id={widgetId}
          title={t('performance.charts.sales_by_store.title')}
          category="Beverages"
          allowChangeVisualization
          onRemove={
            userWidgets.includes("sales-distribution-chart") && 
            userWidgets.includes("sales-by-store-chart") && 
            userWidgets.length === 2 ? undefined : () => toggleWidget(widgetId)
          }
        >
          <ChartWidget
            id="sales-by-store-chart"
            title={t('performance.charts.sales_by_store.title')}
            data={salesByStoreTypeData}
            dataKey="value"
            initialChartType="bar"
          />
        </Widget>
      );
    }
    
    // Sales Distribution Chart
    else if (widgetId === "sales-distribution-chart") {
      return (
        <Widget
          key={widgetId}
          id={widgetId}
          title={t('performance.charts.sales_distribution.title')}
          category="Beverages"
          allowChangeVisualization
          onRemove={
            userWidgets.includes("sales-distribution-chart") && 
            userWidgets.includes("sales-by-store-chart") && 
            userWidgets.length === 2 ? undefined : () => toggleWidget(widgetId)
          }
        >
          <ChartWidget
            id="sales-distribution-chart"
            title={t('performance.charts.sales_distribution.title')}
            data={salesDistributionData}
            dataKey="value"
            initialChartType="pie"
          />
        </Widget>
      );
    }
    
    // Top SKUs Table
    else if (widgetId === "top-skus-table") {
      return (
        <Widget
          key={widgetId}
          id={widgetId}
          title={t('performance.tables.top_skus.title')}
          category="Beverages"
          onRemove={() => toggleWidget(widgetId)}
        >
          <DataTableWidget
            id="top-skus-table"
            title={t('performance.tables.top_skus.title')}
            data={topSkusData}
            columns={[
              { key: 'sku', label: t('performance.tables.columns.sku') },
              { key: 'name', label: t('performance.tables.columns.name') },
              { key: 'sales', label: t('performance.tables.columns.sales'), isCurrency: true },
              { key: 'volume', label: t('performance.tables.columns.volume') },
              { key: 'share', label: t('performance.tables.columns.share'), format: (value: number) => `${value}%` }
            ]}
            allowCSVExport={true}
          />
        </Widget>
      );
    }
    
    // Detailed SKUs Table
    else if (widgetId === "detailed-skus-table") {
      return (
        <Widget
          key={widgetId}
          id={widgetId}
          title={t('performance.tables.detailed_skus.title')}
          category="Beverages"
          allowChangeVisualization
          onRemove={() => toggleWidget(widgetId)}
        >
          <DataTableWidget
            id="custom-top-skus-table"
            title={t('performance.tables.detailed_skus.title')}
            data={customTopSkusData}
            columns={[
              { key: "sku", label: t('performance.tables.columns.sku'), visible: true },
              { key: "name", label: t('performance.tables.columns.name'), visible: true },
              { key: "sales", label: t('performance.tables.columns.sales'), visible: true, format: (value) => new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US').format(value) },
              { key: "units", label: t('performance.tables.columns.units'), visible: true, format: (value) => new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US').format(value) },
              { key: "share", label: t('performance.tables.columns.share'), visible: true, format: (value) => `${value}%` }
            ]}
            allowColumnSelection={true}
            allowCSVExport={true}
            allowAIInteraction={true}
          />
        </Widget>
      );
    }
    
    // Riyadh Sales Heatmap
    else if (widgetId === "riyadh-sales-heatmap") {
      return (
        <Widget
          key={widgetId}
          id={widgetId}
          title={t('performance.maps.riyadh_sales.title')}
          category="Beverages"
          onRemove={() => toggleWidget(widgetId)}
          data={riyadhSalesData}
        >
          <div className="h-full min-h-[220px] w-full">
            <HeatmapWidget
              id="riyadh-sales-heatmap"
              title={t('performance.maps.riyadh_sales.title')}
              data={riyadhSalesData}
            />
          </div>
        </Widget>
      );
    }
    
    return null;
  };

  // Show loading state while dashboard state is loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-datacue-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-datacue-primary">{t('performance.title')}</h1>
          <p className="text-datacue-primary/70">
            {t('performance.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Individual Filter Buttons - using persisted state */}
          {/* Store Type Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline"
                className="flex items-center gap-2 bg-datacue-primary/5 border-datacue-primary/20 hover:bg-datacue-primary/10"
              >
                <Store size={16} className="text-datacue-primary" />
                <span>{t('performance.filters.store_label')} <span className="font-medium">{dashboardState.filters.storeTypes.length > 1 
                  ? t('performance.filters.selected_count', { count: dashboardState.filters.storeTypes.length })
                  : dashboardState.filters.storeTypes[0]}</span></span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 max-h-72 overflow-y-auto rounded-lg shadow-lg p-2" align={isRTL ? "start" : "end"}>
              <div className="space-y-2">
                <h3 className="font-medium">{t('performance.filters.select_store_types')}</h3>
                <div className="grid gap-1">
                  {storeTypes.map((type) => {
                    const checked = dashboardState.filters.storeTypes.includes(type);
                    const disabled = type !== "All" && dashboardState.filters.storeTypes.includes("All");
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => !disabled && handleStoreTypeChange(type)}
                        className={`flex items-center w-full px-2 py-2 rounded-md transition-colors text-left ${checked ? 'bg-datacue-primary/10' : 'hover:bg-gray-100'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="flex items-center gap-2 flex-1">
                          <span className={`inline-block h-4 w-4 border rounded ${checked ? 'border-datacue-primary bg-datacue-primary/80' : 'border-gray-300 bg-white'}`}>{checked && <Check size={14} className="text-white mx-auto" />}</span>
                          <span className="text-sm">{type}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Location Filter - using persisted state */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline"
                className="flex items-center gap-2 bg-datacue-primary/5 border-datacue-primary/20 hover:bg-datacue-primary/10"
              >
                <Map size={16} className="text-datacue-primary" />
                <span>{t('performance.filters.location_label')} <span className="font-medium">{dashboardState.filters.locationZones.length > 1 
                  ? t('performance.filters.selected_count', { count: dashboardState.filters.locationZones.length })
                  : dashboardState.filters.locationZones[0]}</span></span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 max-h-72 overflow-y-auto rounded-lg shadow-lg p-2" align={isRTL ? "start" : "end"}>
              <div className="space-y-2">
                <h3 className="font-medium">{t('performance.filters.select_locations')}</h3>
                <div className="grid gap-1">
                  {locationZones.map((zone) => {
                    const checked = dashboardState.filters.locationZones.includes(zone);
                    const disabled = zone !== "All" && dashboardState.filters.locationZones.includes("All");
                    return (
                      <button
                        key={zone}
                        type="button"
                        onClick={() => !disabled && handleLocationChange(zone)}
                        className={`flex items-center w-full px-2 py-2 rounded-md transition-colors text-left ${checked ? 'bg-datacue-primary/10' : 'hover:bg-gray-100'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="flex items-center gap-2 flex-1">
                          <span className={`inline-block h-4 w-4 border rounded ${checked ? 'border-datacue-primary bg-datacue-primary/80' : 'border-gray-300 bg-white'}`}>{checked && <Check size={14} className="text-white mx-auto" />}</span>
                          <span className="text-sm">{zone}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Time Period Filter - using persisted state */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline"
                className="flex items-center gap-2 bg-datacue-primary/5 border-datacue-primary/20 hover:bg-datacue-primary/10"
              >
                <CalendarIcon size={16} className="text-datacue-primary" />
                <span>{t('performance.filters.period_label')} <span className="font-medium">{t(`time_periods.${dashboardState.filters.timePeriod.toLowerCase()}`)}</span></span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align={isRTL ? "start" : "end"}>
              <div className="space-y-2">
                <h3 className="font-medium">{t('performance.filters.select_time_period')}</h3>
                <div className="grid gap-1">
                  {timePeriods.map((period) => (
                    <Button
                      key={period}
                      variant={dashboardState.filters.timePeriod === period ? "default" : "outline"}
                      className={dashboardState.filters.timePeriod === period ? "bg-datacue-primary" : ""}
                      onClick={() => handleTimePeriodChange(period)}
                    >
                      {t(`time_periods.${period.toLowerCase()}`)}
                    </Button>
                  ))}
                </div>
                
                {dashboardState.filters.timePeriod === "Custom" && (
                  <div className="mt-2 pt-2 border-t">
                    <label className="text-sm text-gray-500 block mb-1">{t('performance.filters.pick_date_range')}</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal text-sm">
                          <CalendarIcon className={cn("h-4 w-4", isRTL ? "ms-2" : "me-2")} />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                              </>
                            ) : (
                              format(dateRange.from, "MMM d, yyyy")
                            )
                          ) : (
                            t('performance.filters.pick_date_range')
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0" 
                        align={isRTL ? "start" : "end"} 
                        side="left"
                        sideOffset={10}
                      >
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={handleDateRangeSelect}
                          initialFocus
                          numberOfMonths={1}
                          disabled={(date) => 
                            date > new Date() || date < new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                          }
                          className="rounded-md border p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Reset Button with Confirmation Dialog */}
          <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="text-datacue-primary hover:bg-datacue-primary/10"
                aria-label={t('common.reset')}
              >
                <RotateCcw size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('performance.reset.confirm_title')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('performance.reset.confirm_description')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    resetToDefault();
                    toast({
                      title: "Dashboard Reset",
                      description: "Dashboard has been reset to default settings",
                    });
                    setIsResetDialogOpen(false);
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t('common.reset')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* Add Widget Button */}
          <div className="relative ml-2" ref={menuRef}>
            <Button
              onClick={() => setIsAddWidgetOpen(!isAddWidgetOpen)}
              className="flex items-center gap-2 bg-datacue-primary hover:bg-datacue-primary/90 text-white"
            >
              <Plus size={16} />
              {t('performance.widgets.add_widgets')}
            </Button>
            
            {/* Add Widget Menu */}
            {isAddWidgetOpen && (
              <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-10 w-80 bg-white shadow-lg rounded-md p-3 z-10 border border-gray-200 max-h-[70vh] overflow-y-auto`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{t('performance.widgets.dashboard_widgets')}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsAddWidgetOpen(false)} className="h-7 w-7 p-0">
                    <X size={16} />
                  </Button>
                </div>
                
                {/* Categorized Widget List */}
                <div className="space-y-4">
                  {Object.entries(groupedWidgets).map(([category, widgets]) => (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">{category}</h4>
                      <div className="space-y-1">
                        {widgets.map((widget) => {
                          const isActive = userWidgets.includes(widget.id);
                          // Special case for default widgets
                          const isDisabled = 
                            (widget.id === "sales-by-store-chart" || widget.id === "sales-distribution-chart") && 
                            userWidgets.includes("sales-by-store-chart") && 
                            userWidgets.includes("sales-distribution-chart") &&
                            userWidgets.length === 2 && isActive;
                            
                          return (
                            <button
                              key={widget.id}
                              onClick={() => toggleWidget(widget.id)}
                              className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors text-left ${
                                isActive 
                                  ? 'bg-datacue-primary/10 hover:bg-datacue-primary/20' 
                                  : 'hover:bg-gray-100'
                              } ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                              disabled={isDisabled}
                            >
                              <widget.icon 
                                size={20} 
                                className={isActive ? 'text-datacue-primary' : 'text-gray-500'} 
                              />
                              <div>
                                <div className={`font-medium ${isActive ? 'text-datacue-primary' : 'text-gray-800'}`}>
                                  {widget.name}
                                  {isActive && <span className={cn(isRTL ? "me-2" : "ml-2", "text-xs")}>✓</span>}
                                </div>
                                <div className="text-xs text-gray-500">{widget.description}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">{t('performance.widgets.widget_instructions')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Filter Status - using persisted state */}
      {(dashboardState.filters.storeTypes.length !== 1 || dashboardState.filters.storeTypes[0] !== "All" || 
        dashboardState.filters.locationZones.length !== 1 || dashboardState.filters.locationZones[0] !== "All" || 
        dashboardState.filters.timePeriod !== "Weekly") && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-datacue-primary/70">{t('performance.filters.active_filters')}</span>
          <div className="flex flex-wrap gap-2">
            {/* Only show Store chip when non-default */}
            {(dashboardState.filters.storeTypes.length !== 1 || dashboardState.filters.storeTypes[0] !== "All") && (
              <span className="px-2 py-1 bg-datacue-primary/10 rounded-full text-datacue-primary">
                {t('performance.filters.store_label')} {dashboardState.filters.storeTypes.join(", ")}
              </span>
            )}
            
            {/* Only show Location chip when non-default */}
            {(dashboardState.filters.locationZones.length !== 1 || dashboardState.filters.locationZones[0] !== "All") && (
              <span className="px-2 py-1 bg-datacue-primary/10 rounded-full text-datacue-primary">
                {t('performance.filters.location_label')} {dashboardState.filters.locationZones.join(", ")}
              </span>
            )}
            
            {/* Only show Period chip when non-default */}
            {dashboardState.filters.timePeriod !== "Weekly" && (
              <span className="px-2 py-1 bg-datacue-primary/10 rounded-full text-datacue-primary">
                {t('performance.filters.period_label')} {t(`time_periods.${dashboardState.filters.timePeriod.toLowerCase()}`)}
                {dashboardState.filters.timePeriod === "Custom" && dateRange.from && dateRange.to && 
                  ` (${t('performance.notifications.date_range_message', { from: format(dateRange.from, "MMM d, yyyy"), to: format(dateRange.to, "MMM d, yyyy") })})`
                }
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Responsive Draggable Grid Layout */}
      <div className={cn("widget-grid", isRTL && "rtl-widget-grid")}>
        {userWidgets.length > 0 ? (
          <ResponsiveGridLayout
            className={cn("layout", isRTL && "rtl-layout")}
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 2, md: 2, sm: 1, xs: 1, xxs: 1 }}
            rowHeight={160}
            width={1200}
            onLayoutChange={handleLayoutChange}
            isDraggable={true}
            isResizable={false}
            margin={[16, 16]}
            containerPadding={isRTL ? [16, 16] : [8, 8]}
            draggableHandle=".draggable-handle"
            useCSSTransforms={true}
            compactType="vertical"
            preventCollision={false}
            isRTL={isRTL}
          >
            {userWidgets.map((widgetId) => (
              <div key={widgetId} className="widget-container">
                {renderUserWidget(widgetId)}
              </div>
            ))}
          </ResponsiveGridLayout>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-md text-center">
            <div className="text-datacue-primary/50 mb-4">
              <BarChart size={48} />
            </div>
            <h3 className="text-lg font-medium text-datacue-primary mb-2">{t('performance.widgets.no_widgets_title')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('performance.widgets.no_widgets_description')}</p>
            <button
              onClick={toggleAddWidgetMenu}
              className="flex items-center gap-2 bg-datacue-primary hover:bg-datacue-primary/90 text-white px-3 py-1.5 rounded-md transition-colors text-sm"
            >
              <Plus size={16} />
              {t('performance.widgets.add_first_widget')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Performance;
