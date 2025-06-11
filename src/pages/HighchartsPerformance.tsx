import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Widget from "../components/widgets/Widget";
import { useDataContext } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { useAI } from "@/contexts/AIContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, LineChart, AreaChart, Columns3, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Types for the new Brand filter
export type Brand = "Coca-Cola" | "Pepsi" | "Local Brands" | "Premium Brands" | "All";

type ChartType = {
  sales: 'stackedBar' | 'groupedBar' | 'areaChart';
  price: 'line' | 'spline' | 'column';
};

type SalesData = {
  month: string;
  northRiyadh: number;
  southRiyadh: number;
  eastRiyadh: number;
  westRiyadh: number;
  centralRiyadh: number;
  total: number;
};

type PriceData = {
  month: string;
  northRiyadh: number;
  southRiyadh: number;
  eastRiyadh: number;
  westRiyadh: number;
  centralRiyadh: number;
};

const HighchartsPerformance: React.FC = () => {
  const { filters, isLoading } = useDataContext();
  const { user } = useAuth();
  const { openAITray } = useAI();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Local state for new filters
  const [selectedBrand, setSelectedBrand] = useState<Brand>("All");
  const [chartTypes, setChartTypes] = useState<ChartType>({
    sales: 'stackedBar',
    price: 'line'
  });

  // Modal state
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

  // Sample data - in real app, this would come from API
  const salesData: SalesData[] = [
    { month: 'Jan', northRiyadh: 1200000, southRiyadh: 980000, eastRiyadh: 850000, westRiyadh: 750000, centralRiyadh: 920000, total: 4700000 },
    { month: 'Feb', northRiyadh: 1300000, southRiyadh: 1050000, eastRiyadh: 900000, westRiyadh: 800000, centralRiyadh: 950000, total: 5000000 },
    { month: 'Mar', northRiyadh: 1150000, southRiyadh: 920000, eastRiyadh: 780000, westRiyadh: 720000, centralRiyadh: 880000, total: 4450000 },
    { month: 'Apr', northRiyadh: 1400000, southRiyadh: 1120000, eastRiyadh: 950000, westRiyadh: 850000, centralRiyadh: 1000000, total: 5320000 },
    { month: 'May', northRiyadh: 1350000, southRiyadh: 1080000, eastRiyadh: 920000, westRiyadh: 820000, centralRiyadh: 970000, total: 5140000 },
    { month: 'Jun', northRiyadh: 1500000, southRiyadh: 1200000, eastRiyadh: 1000000, westRiyadh: 900000, centralRiyadh: 1100000, total: 5700000 }
  ];

  const priceData: PriceData[] = [
    { month: 'Jan', northRiyadh: 4.50, southRiyadh: 4.30, eastRiyadh: 4.20, westRiyadh: 4.10, centralRiyadh: 4.60 },
    { month: 'Feb', northRiyadh: 4.75, southRiyadh: 4.55, eastRiyadh: 4.45, westRiyadh: 4.35, centralRiyadh: 4.85 },
    { month: 'Mar', northRiyadh: 4.65, southRiyadh: 4.45, eastRiyadh: 4.35, westRiyadh: 4.25, centralRiyadh: 4.75 },
    { month: 'Apr', northRiyadh: 4.90, southRiyadh: 4.70, eastRiyadh: 4.60, westRiyadh: 4.50, centralRiyadh: 5.00 },
    { month: 'May', northRiyadh: 4.85, southRiyadh: 4.65, eastRiyadh: 4.55, westRiyadh: 4.45, centralRiyadh: 4.95 },
    { month: 'Jun', northRiyadh: 5.10, southRiyadh: 4.90, eastRiyadh: 4.80, westRiyadh: 4.70, centralRiyadh: 5.20 }
  ];

  // Brand options
  const brandOptions: Brand[] = ["All", "Coca-Cola", "Pepsi", "Local Brands", "Premium Brands"];

  // AI functionality handlers
  const handleSalesAIClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      openAITray({
        id: "highcharts-sales-value",
        title: t('performance.highcharts.charts.salesValue.title'),
        type: "widget",
        data: { salesData, chartType: chartTypes.sales },
        category: "Highcharts"
      });
      
      toast.success(`${t('common.success')}: ${t('common.ai_insights_opened')} Sales Value Analysis`);
    } catch (error) {
      console.error("Error opening AI tray:", error);
      toast.error(t('common.ai_error'));
    }
  };

  const handlePriceAIClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      openAITray({
        id: "highcharts-price-trend",
        title: t('performance.highcharts.charts.avgPrice.title'),
        type: "widget",
        data: { priceData, chartType: chartTypes.price },
        category: "Highcharts"
      });
      
      toast.success(`${t('common.success')}: ${t('common.ai_insights_opened')} Price Analysis`);
    } catch (error) {
      console.error("Error opening AI tray:", error);
      toast.error(t('common.ai_error'));
    }
  };

  // Chart configuration for Sales Value by Zone
  const getSalesChartConfig = () => {
    console.log('Generating sales chart config with type:', chartTypes.sales);
    
    // Simple test configuration
    const simpleConfig = {
      chart: {
        type: 'column',
        height: 280
      },
      title: {
        text: 'Sales Value by Zone'
      },
      credits: { enabled: false },
      xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      },
      yAxis: {
        title: {
          text: 'Sales (SAR Million)'
        }
      },
      series: [{
        name: 'North Riyadh',
        data: [1.2, 1.3, 1.15, 1.4, 1.35, 1.5],
        color: '#0ea5e9'
      }, {
        name: 'South Riyadh', 
        data: [0.98, 1.05, 0.92, 1.12, 1.08, 1.2],
        color: '#10b981'
      }, {
        name: 'East Riyadh',
        data: [0.85, 0.9, 0.78, 0.95, 0.92, 1.0],
        color: '#f59e0b'
      }],
      plotOptions: {
        column: {
          stacking: chartTypes.sales === 'stackedBar' ? 'normal' : undefined
        }
      }
    };

    console.log('Final config:', simpleConfig);
    return simpleConfig;
  };

  // Chart configuration for Average Selling Price by Zone
  const getPriceChartConfig = () => {
    console.log('Generating price chart config with type:', chartTypes.price);
    
    // Simple test configuration
    const simpleConfig = {
      chart: {
        type: chartTypes.price === 'column' ? 'column' : 'line',
        height: 280
      },
      title: {
        text: 'Average Price by Zone'
      },
      credits: { enabled: false },
      xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      },
      yAxis: {
        title: {
          text: 'Price (SAR)'
        }
      },
      series: [{
        name: 'North Riyadh',
        data: [4.5, 4.75, 4.65, 4.9, 4.85, 5.1],
        color: '#0ea5e9'
      }, {
        name: 'South Riyadh',
        data: [4.3, 4.55, 4.45, 4.7, 4.65, 4.9],
        color: '#10b981'
      }, {
        name: 'East Riyadh',
        data: [4.2, 4.45, 4.35, 4.6, 4.55, 4.8],
        color: '#f59e0b'
      }]
    };

    console.log('Final price config:', simpleConfig);
    return simpleConfig;
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-semibold text-datacue-primary">
          {t('navigation.highcharts_performance')}
        </h1>
        <p className="text-datacue-primary/70">
          {t('performance.highcharts.overview')}
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white rounded-lg border">
        <div>
          <label className="text-sm font-medium text-datacue-primary">
            {t('performance.highcharts.filters.zone')}
          </label>
          <Select value={filters.locationZones[0] || "All"} disabled>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t('common.all')}</SelectItem>
              <SelectItem value="North Riyadh">{t('performance.highcharts.zones.north_riyadh')}</SelectItem>
              <SelectItem value="South Riyadh">{t('performance.highcharts.zones.south_riyadh')}</SelectItem>
              <SelectItem value="East Riyadh">{t('performance.highcharts.zones.east_riyadh')}</SelectItem>
              <SelectItem value="West Riyadh">{t('performance.highcharts.zones.west_riyadh')}</SelectItem>
              <SelectItem value="Central Riyadh">{t('performance.highcharts.zones.central_riyadh')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-datacue-primary">
            {t('performance.highcharts.filters.brand')}
          </label>
          <Select value={selectedBrand} onValueChange={(value: Brand) => setSelectedBrand(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {brandOptions.map(brand => (
                <SelectItem key={brand} value={brand}>
                  {brand === "All" ? t('common.all') : brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-datacue-primary">
            {t('performance.highcharts.filters.time_period')}
          </label>
          <Select value={filters.timePeriod} disabled>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Monthly">{t('performance.highcharts.filters.monthly')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Badge variant="secondary" className="h-fit">
            {t('performance.highcharts.filters.active_filters', { count: selectedBrand !== "All" ? 1 : 0 })}
          </Badge>
        </div>
      </div>

      {/* Professional Highcharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Value Chart */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('performance.highcharts.charts.salesValue.title')}</h3>
            <div className="flex items-center space-x-2">
              <Select 
                value={chartTypes.sales} 
                onValueChange={(value: 'stackedBar' | 'groupedBar' | 'areaChart') => 
                  setChartTypes(prev => ({ ...prev, sales: value }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stackedBar">Stacked Bar</SelectItem>
                  <SelectItem value="groupedBar">Grouped Bar</SelectItem>
                  <SelectItem value="areaChart">Area Chart</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleSalesAIClick}
                className="h-8 w-8 rounded-full text-datacue-primary hover:bg-datacue-accent/20 transition-all duration-200 group"
                title={t('common.open_ai_insights')}
                aria-label={t('common.open_ai_insights')}
              >
                <Sparkles size={16} className="group-hover:scale-110 transition-transform duration-200" />
              </Button>
            </div>
          </div>
          <div className="h-80 bg-gray-50 border border-gray-100 rounded p-2">
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: { 
                  type: chartTypes.sales === 'areaChart' ? 'area' : 'column',
                  height: 300,
                  backgroundColor: 'transparent'
                },
                title: { text: null },
                credits: { enabled: false },
                xAxis: {
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                  gridLineWidth: 0
                },
                yAxis: {
                  title: { text: 'Sales (SAR Million)' },
                  gridLineWidth: 1,
                  gridLineColor: '#f1f5f9'
                },
                tooltip: {
                  shared: true,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderColor: '#e2e8f0',
                  borderRadius: 8,
                  formatter: function() {
                    let tooltip = `<b>${this.x}</b><br/>`;
                    this.points?.forEach((point: any) => {
                      tooltip += `<span style="color:${point.color}">●</span> ${point.series.name}: <b>${point.y}M SAR</b><br/>`;
                    });
                    return tooltip;
                  }
                },
                plotOptions: {
                  column: {
                    stacking: chartTypes.sales === 'stackedBar' ? 'normal' : undefined,
                    borderWidth: 0,
                    borderRadius: 3
                  },
                  area: {
                    stacking: 'normal',
                    marker: { enabled: false }
                  },
                  series: {
                    cursor: 'pointer',
                    events: {
                      click: () => setIsSalesModalOpen(true)
                    }
                  }
                },
                legend: {
                  align: 'center',
                  verticalAlign: 'bottom',
                  layout: 'horizontal',
                  itemStyle: { fontSize: '12px' }
                },
                series: [{
                  name: 'North Riyadh',
                  data: [1.2, 1.3, 1.15, 1.4, 1.35, 1.5],
                  color: '#0ea5e9'
                }, {
                  name: 'South Riyadh', 
                  data: [0.98, 1.05, 0.92, 1.12, 1.08, 1.2],
                  color: '#10b981'
                }, {
                  name: 'East Riyadh',
                  data: [0.85, 0.9, 0.78, 0.95, 0.92, 1.0],
                  color: '#f59e0b'
                }, {
                  name: 'West Riyadh',
                  data: [0.75, 0.8, 0.72, 0.85, 0.82, 0.9],
                  color: '#ef4444'
                }, {
                  name: 'Central Riyadh',
                  data: [0.92, 0.95, 0.88, 1.0, 0.97, 1.1],
                  color: '#8b5cf6'
                }]
              }}
            />
          </div>
        </div>

        {/* Average Price Chart */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('performance.highcharts.charts.avgPrice.title')}</h3>
            <div className="flex items-center space-x-2">
              <Select 
                value={chartTypes.price} 
                onValueChange={(value: 'line' | 'spline' | 'column') => 
                  setChartTypes(prev => ({ ...prev, price: value }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="spline">Spline</SelectItem>
                  <SelectItem value="column">Column</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handlePriceAIClick}
                className="h-8 w-8 rounded-full text-datacue-primary hover:bg-datacue-accent/20 transition-all duration-200 group"
                title={t('common.open_ai_insights')}
                aria-label={t('common.open_ai_insights')}
              >
                <Sparkles size={16} className="group-hover:scale-110 transition-transform duration-200" />
              </Button>
            </div>
          </div>
          <div className="h-80 bg-gray-50 border border-gray-100 rounded p-2">
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: { 
                  type: chartTypes.price === 'column' ? 'column' : (chartTypes.price === 'spline' ? 'spline' : 'line'),
                  height: 300,
                  backgroundColor: 'transparent'
                },
                title: { text: null },
                credits: { enabled: false },
                xAxis: {
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                  gridLineWidth: 0
                },
                yAxis: {
                  title: { text: 'Price (SAR)' },
                  gridLineWidth: 1,
                  gridLineColor: '#f1f5f9'
                },
                tooltip: {
                  shared: true,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderColor: '#e2e8f0',
                  borderRadius: 8,
                  formatter: function() {
                    let tooltip = `<b>${this.x}</b><br/>`;
                    this.points?.forEach((point: any) => {
                      tooltip += `<span style="color:${point.color}">●</span> ${point.series.name}: <b>${point.y} SAR</b><br/>`;
                    });
                    return tooltip;
                  }
                },
                plotOptions: {
                  column: {
                    borderWidth: 0,
                    borderRadius: 3
                  },
                  line: {
                    marker: { 
                      enabled: true,
                      radius: 4,
                      lineWidth: 2,
                      lineColor: '#ffffff'
                    }
                  },
                  spline: {
                    marker: { 
                      enabled: true,
                      radius: 4,
                      lineWidth: 2,
                      lineColor: '#ffffff'
                    }
                  },
                  series: {
                    cursor: 'pointer',
                    events: {
                      click: () => setIsPriceModalOpen(true)
                    }
                  }
                },
                legend: {
                  align: 'center',
                  verticalAlign: 'bottom',
                  layout: 'horizontal',
                  itemStyle: { fontSize: '12px' }
                },
                series: [{
                  name: 'North Riyadh',
                  data: [4.5, 4.75, 4.65, 4.9, 4.85, 5.1],
                  color: '#0ea5e9'
                }, {
                  name: 'South Riyadh',
                  data: [4.3, 4.55, 4.45, 4.7, 4.65, 4.9],
                  color: '#10b981'
                }, {
                  name: 'East Riyadh',
                  data: [4.2, 4.45, 4.35, 4.6, 4.55, 4.8],
                  color: '#f59e0b'
                }, {
                  name: 'West Riyadh',
                  data: [4.1, 4.35, 4.25, 4.5, 4.45, 4.7],
                  color: '#ef4444'
                }, {
                  name: 'Central Riyadh',
                  data: [4.6, 4.85, 4.75, 5.0, 4.95, 5.2],
                  color: '#8b5cf6'
                }]
              }}
            />
          </div>
        </div>
      </div>

      {/* Sales Detail Modal */}
      <Dialog open={isSalesModalOpen} onOpenChange={setIsSalesModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('performance.highcharts.modals.sales_detail.title')}</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.month')}</TableHead>
                  <TableHead>{t('performance.highcharts.zones.north_riyadh')}</TableHead>
                  <TableHead>{t('performance.highcharts.zones.south_riyadh')}</TableHead>
                  <TableHead>{t('performance.highcharts.zones.east_riyadh')}</TableHead>
                  <TableHead>{t('performance.highcharts.zones.west_riyadh')}</TableHead>
                  <TableHead>{t('performance.highcharts.zones.central_riyadh')}</TableHead>
                  <TableHead>{t('common.total')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell>{(row.northRiyadh / 1000000).toFixed(1)}M</TableCell>
                    <TableCell>{(row.southRiyadh / 1000000).toFixed(1)}M</TableCell>
                    <TableCell>{(row.eastRiyadh / 1000000).toFixed(1)}M</TableCell>
                    <TableCell>{(row.westRiyadh / 1000000).toFixed(1)}M</TableCell>
                    <TableCell>{(row.centralRiyadh / 1000000).toFixed(1)}M</TableCell>
                    <TableCell className="font-semibold">{(row.total / 1000000).toFixed(1)}M</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Price Detail Modal */}
      <Dialog open={isPriceModalOpen} onOpenChange={setIsPriceModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('performance.highcharts.modals.price_detail.title')}</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.month')}</TableHead>
                  <TableHead>{t('performance.highcharts.zones.north_riyadh')}</TableHead>
                  <TableHead>{t('performance.highcharts.zones.south_riyadh')}</TableHead>
                  <TableHead>{t('performance.highcharts.zones.east_riyadh')}</TableHead>
                  <TableHead>{t('performance.highcharts.zones.west_riyadh')}</TableHead>
                  <TableHead>{t('performance.highcharts.zones.central_riyadh')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell>{row.northRiyadh} SAR</TableCell>
                    <TableCell>{row.southRiyadh} SAR</TableCell>
                    <TableCell>{row.eastRiyadh} SAR</TableCell>
                    <TableCell>{row.westRiyadh} SAR</TableCell>
                    <TableCell>{row.centralRiyadh} SAR</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HighchartsPerformance; 