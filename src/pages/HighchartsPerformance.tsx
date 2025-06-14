import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Widget from "../components/widgets/Widget";
import { useDataContext } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { useAI } from "@/contexts/AIContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, LineChart, AreaChart, Columns3, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Types for enhanced interactive global filters
export type Brand = "Coca-Cola" | "Pepsi" | "Local Brands" | "Premium Brands" | "All";
export type Zone = "All" | "North Riyadh" | "South Riyadh" | "East Riyadh" | "West Riyadh" | "Central Riyadh";
export type TimePeriod = "Weekly" | "Monthly" | "Quarterly" | "Yearly";

type ChartType = {
  sales: 'stackedBar' | 'groupedBar' | 'areaChart';
  price: 'line' | 'spline' | 'column';
};

// Enhanced filter state type
type FilterState = {
  selectedZone: Zone;
  selectedBrand: Brand;
  selectedTimePeriod: TimePeriod;
  isLoading: boolean;
};

// Enhanced Sub-Zone Data Types
export type SubZone = {
  id: string;
  name: string;
  nameAr: string;
  parentZone: 'North Riyadh' | 'South Riyadh' | 'East Riyadh' | 'West Riyadh' | 'Central Riyadh';
  salesData: number[]; // 6 months of sales data in SAR millions
  priceData: number[]; // 6 months of average price data in SAR
  population?: number;
  area?: number; // in km²
};

export type SubZonePerformance = {
  subZone: SubZone;
  totalSales: number;
  avgPrice: number;
  percentageContribution: number;
  trend: 'up' | 'down' | 'stable';
};

export type ZoneSubZoneData = {
  zoneName: string;
  zoneNameAr: string;
  subZones: SubZone[];
  top10: SubZonePerformance[];
  others: {
    totalSales: number;
    avgPrice: number;
    percentageContribution: number;
    count: number;
  };
  totalZoneSales: number;
  avgZonePrice: number;
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
  const navigate = useNavigate();
  const { filters, isLoading } = useDataContext();
  const { user } = useAuth();
  const { openAITray } = useAI();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Enhanced interactive filter state
  const [filterState, setFilterState] = useState<FilterState>({
    selectedZone: "All",
    selectedBrand: "All", 
    selectedTimePeriod: "Monthly",
    isLoading: false
  });

  const [chartTypes, setChartTypes] = useState<ChartType>({
    sales: 'stackedBar',
    price: 'line'
  });

  // Filter options
  const zoneOptions: Zone[] = ["All", "North Riyadh", "South Riyadh", "East Riyadh", "West Riyadh", "Central Riyadh"];
  const brandOptions: Brand[] = ["All", "Coca-Cola", "Pepsi", "Local Brands", "Premium Brands"];
  const timePeriodOptions: TimePeriod[] = ["Weekly", "Monthly", "Quarterly", "Yearly"];

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

  // Realistic Saudi Arabian district names and data for each zone
  const SUB_ZONES_DATA: Record<string, SubZone[]> = {
    'North Riyadh': [
      { id: 'nr001', name: 'Al Sahafa', nameAr: 'الصحافة', parentZone: 'North Riyadh', salesData: [0.15, 0.17, 0.14, 0.18, 0.16, 0.19], priceData: [4.8, 5.0, 4.9, 5.2, 5.1, 5.4], population: 85000, area: 12.5 },
      { id: 'nr002', name: 'Al Nafal', nameAr: 'النفل', parentZone: 'North Riyadh', salesData: [0.12, 0.14, 0.11, 0.15, 0.13, 0.16], priceData: [4.6, 4.8, 4.7, 5.0, 4.9, 5.2], population: 72000, area: 8.3 },
      { id: 'nr003', name: 'Al Yasmin', nameAr: 'الياسمين', parentZone: 'North Riyadh', salesData: [0.13, 0.15, 0.12, 0.16, 0.14, 0.17], priceData: [4.7, 4.9, 4.8, 5.1, 5.0, 5.3], population: 68000, area: 15.2 },
      { id: 'nr004', name: 'Al Rawda', nameAr: 'الروضة', parentZone: 'North Riyadh', salesData: [0.18, 0.20, 0.17, 0.21, 0.19, 0.22], priceData: [5.0, 5.2, 5.1, 5.4, 5.3, 5.6], population: 95000, area: 18.7 },
      { id: 'nr005', name: 'Al Ghadir', nameAr: 'الغدير', parentZone: 'North Riyadh', salesData: [0.09, 0.11, 0.08, 0.12, 0.10, 0.13], priceData: [4.4, 4.6, 4.5, 4.8, 4.7, 5.0], population: 54000, area: 9.8 },
      { id: 'nr006', name: 'Al Muhammadiyah', nameAr: 'المحمدية', parentZone: 'North Riyadh', salesData: [0.14, 0.16, 0.13, 0.17, 0.15, 0.18], priceData: [4.7, 4.9, 4.8, 5.1, 5.0, 5.3], population: 78000, area: 14.1 },
      { id: 'nr007', name: 'Al Nada', nameAr: 'الندى', parentZone: 'North Riyadh', salesData: [0.10, 0.12, 0.09, 0.13, 0.11, 0.14], priceData: [4.5, 4.7, 4.6, 4.9, 4.8, 5.1], population: 61000, area: 11.6 },
      { id: 'nr008', name: 'Al Olaya', nameAr: 'العليا', parentZone: 'North Riyadh', salesData: [0.16, 0.18, 0.15, 0.19, 0.17, 0.20], priceData: [4.9, 5.1, 5.0, 5.3, 5.2, 5.5], population: 89000, area: 16.4 },
      { id: 'nr009', name: 'Al Wurud', nameAr: 'الورود', parentZone: 'North Riyadh', salesData: [0.11, 0.13, 0.10, 0.14, 0.12, 0.15], priceData: [4.6, 4.8, 4.7, 5.0, 4.9, 5.2], population: 71000, area: 13.2 },
      { id: 'nr010', name: 'King Fahd District', nameAr: 'حي الملك فهد', parentZone: 'North Riyadh', salesData: [0.17, 0.19, 0.16, 0.20, 0.18, 0.21], priceData: [5.1, 5.3, 5.2, 5.5, 5.4, 5.7], population: 82000, area: 19.5 },
      { id: 'nr011', name: 'Al Hamra', nameAr: 'الحمراء', parentZone: 'North Riyadh', salesData: [0.12, 0.14, 0.11, 0.15, 0.13, 0.16], priceData: [4.6, 4.8, 4.7, 5.0, 4.9, 5.2], population: 66000, area: 10.8 },
      { id: 'nr012', name: 'Al Aziziyah', nameAr: 'العزيزية', parentZone: 'North Riyadh', salesData: [0.08, 0.10, 0.07, 0.11, 0.09, 0.12], priceData: [4.3, 4.5, 4.4, 4.7, 4.6, 4.9], population: 58000, area: 8.9 }
    ],
    
    'South Riyadh': [
      { id: 'sr001', name: 'Al Manakh', nameAr: 'المناخ', parentZone: 'South Riyadh', salesData: [0.11, 0.13, 0.10, 0.14, 0.12, 0.15], priceData: [4.3, 4.5, 4.4, 4.7, 4.6, 4.9], population: 67000, area: 11.3 },
      { id: 'sr002', name: 'Al Difa', nameAr: 'الضباط', parentZone: 'South Riyadh', salesData: [0.13, 0.15, 0.12, 0.16, 0.14, 0.17], priceData: [4.4, 4.6, 4.5, 4.8, 4.7, 5.0], population: 74000, area: 13.7 },
      { id: 'sr003', name: 'Al Khaleej', nameAr: 'الخليج', parentZone: 'South Riyadh', salesData: [0.14, 0.16, 0.13, 0.17, 0.15, 0.18], priceData: [4.5, 4.7, 4.6, 4.9, 4.8, 5.1], population: 81000, area: 15.1 },
      { id: 'sr004', name: 'Al Dar Al Baida', nameAr: 'الدار البيضاء', parentZone: 'South Riyadh', salesData: [0.12, 0.14, 0.11, 0.15, 0.13, 0.16], priceData: [4.4, 4.6, 4.5, 4.8, 4.7, 5.0], population: 69000, area: 12.4 },
      { id: 'sr005', name: 'Al Naeem', nameAr: 'النعيم', parentZone: 'South Riyadh', salesData: [0.13, 0.15, 0.12, 0.16, 0.14, 0.17], priceData: [4.5, 4.7, 4.6, 4.9, 4.8, 5.1], population: 76000, area: 14.8 },
      { id: 'sr006', name: 'Al Faisaliyah', nameAr: 'الفيصلية', parentZone: 'South Riyadh', salesData: [0.10, 0.12, 0.09, 0.13, 0.11, 0.14], priceData: [4.2, 4.4, 4.3, 4.6, 4.5, 4.8], population: 63000, area: 9.6 },
      { id: 'sr007', name: 'Al Amal', nameAr: 'الأمل', parentZone: 'South Riyadh', salesData: [0.12, 0.14, 0.11, 0.15, 0.13, 0.16], priceData: [4.4, 4.6, 4.5, 4.8, 4.7, 5.0], population: 72000, area: 13.2 },
      { id: 'sr008', name: 'Al Tuwaiq', nameAr: 'طويق', parentZone: 'South Riyadh', salesData: [0.15, 0.17, 0.14, 0.18, 0.16, 0.19], priceData: [4.6, 4.8, 4.7, 5.0, 4.9, 5.2], population: 85000, area: 16.9 },
      { id: 'sr009', name: 'Al Hada', nameAr: 'الهدا', parentZone: 'South Riyadh', salesData: [0.09, 0.11, 0.08, 0.12, 0.10, 0.13], priceData: [4.1, 4.3, 4.2, 4.5, 4.4, 4.7], population: 58000, area: 10.2 },
      { id: 'sr010', name: 'Al Riyan', nameAr: 'الريان', parentZone: 'South Riyadh', salesData: [0.14, 0.16, 0.13, 0.17, 0.15, 0.18], priceData: [4.5, 4.7, 4.6, 4.9, 4.8, 5.1], population: 79000, area: 14.5 },
      { id: 'sr011', name: 'Al Andalus', nameAr: 'الأندلس', parentZone: 'South Riyadh', salesData: [0.12, 0.14, 0.11, 0.15, 0.13, 0.16], priceData: [4.4, 4.6, 4.5, 4.8, 4.7, 5.0], population: 71000, area: 12.8 },
      { id: 'sr012', name: 'Al Salam', nameAr: 'السلام', parentZone: 'South Riyadh', salesData: [0.11, 0.13, 0.10, 0.14, 0.12, 0.15], priceData: [4.3, 4.5, 4.4, 4.7, 4.6, 4.9], population: 64000, area: 11.1 }
    ],
    
    'East Riyadh': [
      { id: 'er001', name: 'Al Khalidiyah', nameAr: 'الخالدية', parentZone: 'East Riyadh', salesData: [0.12, 0.14, 0.11, 0.15, 0.13, 0.16], priceData: [4.2, 4.4, 4.3, 4.6, 4.5, 4.8], population: 73000, area: 12.6 },
      { id: 'er002', name: 'Al Naseem', nameAr: 'النسيم', parentZone: 'East Riyadh', salesData: [0.11, 0.13, 0.10, 0.14, 0.12, 0.15], priceData: [4.1, 4.3, 4.2, 4.5, 4.4, 4.7], population: 68000, area: 11.4 },
      { id: 'er003', name: 'Al Badiah', nameAr: 'البادية', parentZone: 'East Riyadh', salesData: [0.14, 0.16, 0.13, 0.17, 0.15, 0.18], priceData: [4.3, 4.5, 4.4, 4.7, 4.6, 4.9], population: 82000, area: 15.3 },
      { id: 'er004', name: 'Al Rabia', nameAr: 'الربيع', parentZone: 'East Riyadh', salesData: [0.09, 0.11, 0.08, 0.12, 0.10, 0.13], priceData: [4.0, 4.2, 4.1, 4.4, 4.3, 4.6], population: 59000, area: 9.8 },
      { id: 'er005', name: 'Al Rahmaniyah', nameAr: 'الرحمانية', parentZone: 'East Riyadh', salesData: [0.13, 0.15, 0.12, 0.16, 0.14, 0.17], priceData: [4.2, 4.4, 4.3, 4.6, 4.5, 4.8], population: 75000, area: 13.9 },
      { id: 'er006', name: 'Al Mahdiyah', nameAr: 'المهدية', parentZone: 'East Riyadh', salesData: [0.10, 0.12, 0.09, 0.13, 0.11, 0.14], priceData: [4.1, 4.3, 4.2, 4.5, 4.4, 4.7], population: 64000, area: 10.7 },
      { id: 'er007', name: 'Al Taawun', nameAr: 'التعاون', parentZone: 'East Riyadh', salesData: [0.13, 0.15, 0.12, 0.16, 0.14, 0.17], priceData: [4.2, 4.4, 4.3, 4.6, 4.5, 4.8], population: 78000, area: 14.2 },
      { id: 'er008', name: 'Al Jarradiyah', nameAr: 'الجرادية', parentZone: 'East Riyadh', salesData: [0.11, 0.13, 0.10, 0.14, 0.12, 0.15], priceData: [4.1, 4.3, 4.2, 4.5, 4.4, 4.7], population: 66000, area: 11.8 },
      { id: 'er009', name: 'Al Qadsia', nameAr: 'القادسية', parentZone: 'East Riyadh', salesData: [0.12, 0.14, 0.11, 0.15, 0.13, 0.16], priceData: [4.2, 4.4, 4.3, 4.6, 4.5, 4.8], population: 71000, area: 13.1 },
      { id: 'er010', name: 'Al Khuzama', nameAr: 'الخزامى', parentZone: 'East Riyadh', salesData: [0.10, 0.12, 0.09, 0.13, 0.11, 0.14], priceData: [4.1, 4.3, 4.2, 4.5, 4.4, 4.7], population: 62000, area: 10.4 },
      { id: 'er011', name: 'Al Dhubbat', nameAr: 'الضباط', parentZone: 'East Riyadh', salesData: [0.11, 0.13, 0.10, 0.14, 0.12, 0.15], priceData: [4.1, 4.3, 4.2, 4.5, 4.4, 4.7], population: 69000, area: 12.3 },
      { id: 'er012', name: 'Al Safarat', nameAr: 'السفارات', parentZone: 'East Riyadh', salesData: [0.14, 0.16, 0.13, 0.17, 0.15, 0.18], priceData: [4.3, 4.5, 4.4, 4.7, 4.6, 4.9], population: 84000, area: 16.7 }
    ],
    
    'West Riyadh': [
      { id: 'wr001', name: 'Al Shifa', nameAr: 'الشفا', parentZone: 'West Riyadh', salesData: [0.09, 0.11, 0.08, 0.12, 0.10, 0.13], priceData: [4.0, 4.2, 4.1, 4.4, 4.3, 4.6], population: 61000, area: 10.5 },
      { id: 'wr002', name: 'Al Diriyah', nameAr: 'الدرعية', parentZone: 'West Riyadh', salesData: [0.13, 0.15, 0.12, 0.16, 0.14, 0.17], priceData: [4.2, 4.4, 4.3, 4.6, 4.5, 4.8], population: 78000, area: 14.8 },
      { id: 'wr003', name: 'Al Shuhada', nameAr: 'الشهداء', parentZone: 'West Riyadh', salesData: [0.10, 0.12, 0.09, 0.13, 0.11, 0.14], priceData: [4.1, 4.3, 4.2, 4.5, 4.4, 4.7], population: 65000, area: 11.9 },
      { id: 'wr004', name: 'Al Jawhara', nameAr: 'الجوهرة', parentZone: 'West Riyadh', salesData: [0.11, 0.13, 0.10, 0.14, 0.12, 0.15], priceData: [4.1, 4.3, 4.2, 4.5, 4.4, 4.7], population: 72000, area: 13.4 },
      { id: 'wr005', name: 'Al Rabwah', nameAr: 'الربوة', parentZone: 'West Riyadh', salesData: [0.08, 0.10, 0.07, 0.11, 0.09, 0.12], priceData: [3.9, 4.1, 4.0, 4.3, 4.2, 4.5], population: 58000, area: 9.7 },
      { id: 'wr006', name: 'Al Siteen', nameAr: 'الستين', parentZone: 'West Riyadh', salesData: [0.12, 0.14, 0.11, 0.15, 0.13, 0.16], priceData: [4.1, 4.3, 4.2, 4.5, 4.4, 4.7], population: 74000, area: 12.8 },
      { id: 'wr007', name: 'Al Irqah', nameAr: 'العرقة', parentZone: 'West Riyadh', salesData: [0.10, 0.12, 0.09, 0.13, 0.11, 0.14], priceData: [4.0, 4.2, 4.1, 4.4, 4.3, 4.6], population: 67000, area: 11.6 },
      { id: 'wr008', name: 'Al Suwaidi', nameAr: 'السويدي', parentZone: 'West Riyadh', salesData: [0.13, 0.15, 0.12, 0.16, 0.14, 0.17], priceData: [4.2, 4.4, 4.3, 4.6, 4.5, 4.8], population: 80000, area: 15.2 },
      { id: 'wr009', name: 'Al Washm', nameAr: 'الوشم', parentZone: 'West Riyadh', salesData: [0.09, 0.11, 0.08, 0.12, 0.10, 0.13], priceData: [4.0, 4.2, 4.1, 4.4, 4.3, 4.6], population: 63000, area: 10.8 },
      { id: 'wr010', name: 'Al Izdihar', nameAr: 'الازدهار', parentZone: 'West Riyadh', salesData: [0.12, 0.14, 0.11, 0.15, 0.13, 0.16], priceData: [4.1, 4.3, 4.2, 4.5, 4.4, 4.7], population: 76000, area: 13.7 },
      { id: 'wr011', name: 'Al Khair', nameAr: 'الخير', parentZone: 'West Riyadh', salesData: [0.09, 0.11, 0.08, 0.12, 0.10, 0.13], priceData: [4.0, 4.2, 4.1, 4.4, 4.3, 4.6], population: 59000, area: 9.9 },
      { id: 'wr012', name: 'Al Wadi', nameAr: 'الوادي', parentZone: 'West Riyadh', salesData: [0.10, 0.12, 0.09, 0.13, 0.11, 0.14], priceData: [4.0, 4.2, 4.1, 4.4, 4.3, 4.6], population: 68000, area: 12.1 }
    ],
    
    'Central Riyadh': [
      { id: 'cr001', name: 'Al Malaz', nameAr: 'الملز', parentZone: 'Central Riyadh', salesData: [0.16, 0.18, 0.15, 0.19, 0.17, 0.20], priceData: [4.6, 4.8, 4.7, 5.0, 4.9, 5.2], population: 95000, area: 18.3 },
      { id: 'cr002', name: 'Al Batha', nameAr: 'البطحاء', parentZone: 'Central Riyadh', salesData: [0.15, 0.17, 0.14, 0.18, 0.16, 0.19], priceData: [4.5, 4.7, 4.6, 4.9, 4.8, 5.1], population: 87000, area: 16.1 },
      { id: 'cr003', name: 'Al Fouta', nameAr: 'الفوطة', parentZone: 'Central Riyadh', salesData: [0.12, 0.14, 0.11, 0.15, 0.13, 0.16], priceData: [4.4, 4.6, 4.5, 4.8, 4.7, 5.0], population: 72000, area: 13.5 },
      { id: 'cr004', name: 'Al Margab', nameAr: 'المرقب', parentZone: 'Central Riyadh', salesData: [0.14, 0.16, 0.13, 0.17, 0.15, 0.18], priceData: [4.5, 4.7, 4.6, 4.9, 4.8, 5.1], population: 84000, area: 15.7 },
      { id: 'cr005', name: 'Al Dirah', nameAr: 'الديرة', parentZone: 'Central Riyadh', salesData: [0.15, 0.17, 0.14, 0.18, 0.16, 0.19], priceData: [4.5, 4.7, 4.6, 4.9, 4.8, 5.1], population: 91000, area: 17.2 },
      { id: 'cr006', name: 'Al Murabba', nameAr: 'المربع', parentZone: 'Central Riyadh', salesData: [0.13, 0.15, 0.12, 0.16, 0.14, 0.17], priceData: [4.4, 4.6, 4.5, 4.8, 4.7, 5.0], population: 78000, area: 14.6 },
      { id: 'cr007', name: 'Al Manfuhah', nameAr: 'المنفوحة', parentZone: 'Central Riyadh', salesData: [0.11, 0.13, 0.10, 0.14, 0.12, 0.15], priceData: [4.3, 4.5, 4.4, 4.7, 4.6, 4.9], population: 69000, area: 12.8 },
      { id: 'cr008', name: 'King Abdul Aziz', nameAr: 'الملك عبدالعزيز', parentZone: 'Central Riyadh', salesData: [0.15, 0.17, 0.14, 0.18, 0.16, 0.19], priceData: [4.5, 4.7, 4.6, 4.9, 4.8, 5.1], population: 88000, area: 16.9 },
      { id: 'cr009', name: 'Al Ambassadors', nameAr: 'السفراء', parentZone: 'Central Riyadh', salesData: [0.13, 0.15, 0.12, 0.16, 0.14, 0.17], priceData: [4.4, 4.6, 4.5, 4.8, 4.7, 5.0], population: 75000, area: 14.1 },
      { id: 'cr010', name: 'Al Maidan', nameAr: 'الميدان', parentZone: 'Central Riyadh', salesData: [0.14, 0.16, 0.13, 0.17, 0.15, 0.18], priceData: [4.5, 4.7, 4.6, 4.9, 4.8, 5.1], population: 81000, area: 15.4 },
      { id: 'cr011', name: 'Al Sulaimaniyah', nameAr: 'السليمانية', parentZone: 'Central Riyadh', salesData: [0.12, 0.14, 0.11, 0.15, 0.13, 0.16], priceData: [4.4, 4.6, 4.5, 4.8, 4.7, 5.0], population: 73000, area: 13.2 },
      { id: 'cr012', name: 'Al Ministerial', nameAr: 'الوزارات', parentZone: 'Central Riyadh', salesData: [0.11, 0.13, 0.10, 0.14, 0.12, 0.15], priceData: [4.3, 4.5, 4.4, 4.7, 4.6, 4.9], population: 66000, area: 11.8 }
    ]
  };

  // Generate complete zone data with top 10 and others calculation
  const generateZoneSubZoneData = (zoneName: string): ZoneSubZoneData => {
    const zoneNameMapping: Record<string, string> = {
      'North Riyadh': 'شمال الرياض',
      'South Riyadh': 'جنوب الرياض', 
      'East Riyadh': 'شرق الرياض',
      'West Riyadh': 'غرب الرياض',
      'Central Riyadh': 'وسط الرياض'
    };
    
    const subZones = SUB_ZONES_DATA[zoneName] || [];
    
    // Calculate total zone sales
    const totalZoneSales = subZones.reduce((sum, subZone) => 
      sum + subZone.salesData.reduce((subSum, val) => subSum + val, 0), 0
    );
    
    // Calculate performance for each sub-zone
    const performances: SubZonePerformance[] = subZones.map(subZone => {
      const totalSales = subZone.salesData.reduce((sum, val) => sum + val, 0);
      const avgPrice = subZone.priceData.reduce((sum, val) => sum + val, 0) / subZone.priceData.length;
      const percentageContribution = (totalSales / totalZoneSales) * 100;
      
      // Calculate trend based on first 3 vs last 3 months
      const firstHalf = subZone.salesData.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
      const secondHalf = subZone.salesData.slice(3, 6).reduce((sum, val) => sum + val, 0) / 3;
      const trendRatio = secondHalf / firstHalf;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (trendRatio > 1.05) trend = 'up';
      else if (trendRatio < 0.95) trend = 'down';
      
      return {
        subZone,
        totalSales,
        avgPrice,
        percentageContribution,
        trend
      };
    });
    
    // Sort by total sales and get top 10
    const sortedPerformances = performances.sort((a, b) => b.totalSales - a.totalSales);
    const top10 = sortedPerformances.slice(0, 10);
    const othersData = sortedPerformances.slice(10);
    
    // Calculate "Others" aggregated data
    const others = {
      totalSales: othersData.reduce((sum, perf) => sum + perf.totalSales, 0),
      avgPrice: othersData.length > 0 
        ? othersData.reduce((sum, perf) => sum + perf.avgPrice, 0) / othersData.length 
        : 0,
      percentageContribution: othersData.reduce((sum, perf) => sum + perf.percentageContribution, 0),
      count: othersData.length
    };
    
    const avgZonePrice = performances.reduce((sum, perf) => sum + perf.avgPrice, 0) / performances.length;
    
    return {
      zoneName,
      zoneNameAr: zoneNameMapping[zoneName] || zoneName,
      subZones,
      top10,
      others,
      totalZoneSales,
      avgZonePrice
    };
  };

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

  // Enhanced chart click handlers for zone navigation
  const handleSalesChartClick = async (event: any) => {
    if (event && event.point && event.point.series) {
      const zoneName = event.point.series.name;
      toast.success(`Navigating to ${zoneName} sales analysis...`);
      navigate(`/sub-zone-analysis/${encodeURIComponent(zoneName)}?type=sales`);
    }
  };

  const handlePriceChartClick = async (event: any) => {
    if (event && event.point && event.point.series) {
      const zoneName = event.point.series.name;
      toast.success(`Navigating to ${zoneName} price analysis...`);
      navigate(`/sub-zone-analysis/${encodeURIComponent(zoneName)}?type=price`);
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

  // Generate dynamic data based on filters
  const generateTimeSeriesData = (timePeriod: TimePeriod) => {
    const baseData = {
      'Monthly': {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        sales: {
          'North Riyadh': [1.2, 1.3, 1.15, 1.4, 1.35, 1.5],
          'South Riyadh': [0.98, 1.05, 0.92, 1.12, 1.08, 1.2],
          'East Riyadh': [0.85, 0.9, 0.78, 0.95, 0.92, 1.0],
          'West Riyadh': [0.75, 0.8, 0.72, 0.85, 0.82, 0.9],
          'Central Riyadh': [0.92, 0.95, 0.88, 1.0, 0.97, 1.1]
        },
        prices: {
          'North Riyadh': [4.5, 4.75, 4.65, 4.9, 4.85, 5.1],
          'South Riyadh': [4.3, 4.55, 4.45, 4.7, 4.65, 4.9],
          'East Riyadh': [4.2, 4.45, 4.35, 4.6, 4.55, 4.8],
          'West Riyadh': [4.1, 4.35, 4.25, 4.5, 4.45, 4.7],
          'Central Riyadh': [4.6, 4.85, 4.75, 5.0, 4.95, 5.2]
        }
      },
      'Weekly': {
        categories: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
        sales: {
          'North Riyadh': [0.3, 0.32, 0.28, 0.35, 0.33, 0.38, 0.36, 0.4],
          'South Riyadh': [0.24, 0.26, 0.23, 0.28, 0.27, 0.30, 0.29, 0.32],
          'East Riyadh': [0.21, 0.22, 0.19, 0.24, 0.23, 0.25, 0.24, 0.27],
          'West Riyadh': [0.18, 0.20, 0.18, 0.21, 0.20, 0.22, 0.21, 0.23],
          'Central Riyadh': [0.23, 0.24, 0.22, 0.25, 0.24, 0.27, 0.26, 0.29]
        },
        prices: {
          'North Riyadh': [4.5, 4.6, 4.7, 4.8, 4.9, 5.0, 5.05, 5.1],
          'South Riyadh': [4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.85, 4.9],
          'East Riyadh': [4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.75, 4.8],
          'West Riyadh': [4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.65, 4.7],
          'Central Riyadh': [4.6, 4.7, 4.8, 4.9, 5.0, 5.1, 5.15, 5.2]
        }
      },
      'Quarterly': {
        categories: ['Q1', 'Q2', 'Q3', 'Q4'],
        sales: {
          'North Riyadh': [3.85, 4.1, 3.9, 4.3],
          'South Riyadh': [2.95, 3.32, 3.1, 3.6],
          'East Riyadh': [2.53, 2.87, 2.7, 3.0],
          'West Riyadh': [2.27, 2.57, 2.4, 2.7],
          'Central Riyadh': [2.75, 2.97, 2.8, 3.2]
        },
        prices: {
          'North Riyadh': [4.6, 4.9, 4.8, 5.0],
          'South Riyadh': [4.4, 4.7, 4.6, 4.8],
          'East Riyadh': [4.3, 4.6, 4.5, 4.7],
          'West Riyadh': [4.2, 4.5, 4.4, 4.6],
          'Central Riyadh': [4.7, 5.0, 4.9, 5.1]
        }
      },
      'Yearly': {
        categories: ['2022', '2023', '2024'],
        sales: {
          'North Riyadh': [15.2, 16.8, 18.1],
          'South Riyadh': [12.1, 13.4, 14.7],
          'East Riyadh': [10.5, 11.6, 12.8],
          'West Riyadh': [9.2, 10.1, 11.3],
          'Central Riyadh': [11.8, 13.0, 14.2]
        },
        prices: {
          'North Riyadh': [4.7, 4.9, 5.1],
          'South Riyadh': [4.5, 4.7, 4.9],
          'East Riyadh': [4.4, 4.6, 4.8],
          'West Riyadh': [4.3, 4.5, 4.7],
          'Central Riyadh': [4.8, 5.0, 5.2]
        }
      }
    };
    return baseData[timePeriod];
  };

  // Filter data based on selected zone
  const getFilteredChartData = () => {
    const timeData = generateTimeSeriesData(filterState.selectedTimePeriod);
    
    if (filterState.selectedZone === "All") {
      return timeData;
    }
    
    // Filter to show only selected zone
    return {
      categories: timeData.categories,
      sales: {
        [filterState.selectedZone]: timeData.sales[filterState.selectedZone as keyof typeof timeData.sales]
      },
      prices: {
        [filterState.selectedZone]: timeData.prices[filterState.selectedZone as keyof typeof timeData.prices]
      }
    };
  };

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filterState.selectedZone !== "All") count++;
    if (filterState.selectedBrand !== "All") count++;
    if (filterState.selectedTimePeriod !== "Monthly") count++;
    return count;
  };

  // Reset filters function
  const resetFilters = () => {
    setFilterState({
      selectedZone: "All",
      selectedBrand: "All",
      selectedTimePeriod: "Monthly",
      isLoading: false
    });
    toast.success("Filters reset to default values");
  };

  // Handle filter loading state reset
  useEffect(() => {
    if (filterState.isLoading) {
      const timer = setTimeout(() => {
        setFilterState(prev => ({ ...prev, isLoading: false }));
        toast.success(`Updated ${filterState.selectedTimePeriod} view for ${filterState.selectedZone}`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filterState.isLoading, filterState.selectedTimePeriod, filterState.selectedZone]);

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
          <Select 
            value={filterState.selectedZone} 
            onValueChange={(value: Zone) => setFilterState(prev => ({ ...prev, selectedZone: value, isLoading: true }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {zoneOptions.map(zone => (
                <SelectItem key={zone} value={zone}>
                  {zone === "All" ? t('common.all') : zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-datacue-primary">
            {t('performance.highcharts.filters.brand')}
          </label>
          <Select 
            value={filterState.selectedBrand} 
            onValueChange={(value: Brand) => setFilterState(prev => ({ ...prev, selectedBrand: value, isLoading: true }))}
          >
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
          <Select 
            value={filterState.selectedTimePeriod} 
            onValueChange={(value: TimePeriod) => setFilterState(prev => ({ ...prev, selectedTimePeriod: value, isLoading: true }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timePeriodOptions.map(period => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end space-x-2">
          <div className="flex flex-col space-y-2">
            <Badge variant="secondary" className="h-fit">
              {t('performance.highcharts.filters.active_filters', { count: getActiveFilterCount() })}
            </Badge>
            {getActiveFilterCount() > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-xs h-8"
                disabled={filterState.isLoading}
              >
                Reset Filters
              </Button>
            )}
          </div>
          {filterState.isLoading && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Updating...</span>
            </div>
          )}
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
          <div className="h-80 bg-gray-50 border border-gray-100 rounded p-2 relative">
            {filterState.isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded">
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Loading sales data...</span>
                </div>
              </div>
            )}
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
                  categories: getFilteredChartData().categories,
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
                      click: handleSalesChartClick
                    }
                  }
                },
                legend: {
                  align: 'center',
                  verticalAlign: 'bottom',
                  layout: 'horizontal',
                  itemStyle: { fontSize: '12px' }
                },
                series: Object.entries(getFilteredChartData().sales).map(([zoneName, data], index) => ({
                  name: zoneName,
                  data: data,
                  color: ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
                }))
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
          <div className="h-80 bg-gray-50 border border-gray-100 rounded p-2 relative">
            {filterState.isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded">
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Loading price data...</span>
                </div>
              </div>
            )}
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
                  categories: getFilteredChartData().categories,
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
                      click: handlePriceChartClick
                    }
                  }
                },
                legend: {
                  align: 'center',
                  verticalAlign: 'bottom',
                  layout: 'horizontal',
                  itemStyle: { fontSize: '12px' }
                },
                series: Object.entries(getFilteredChartData().prices).map(([zoneName, data], index) => ({
                  name: zoneName,
                  data: data,
                  color: ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
                }))
              }}
            />
          </div>
        </div>
      </div>

      {/* Click on chart zones to navigate to detailed sub-zone analysis pages */}
    </div>
  );
};

export default HighchartsPerformance; 