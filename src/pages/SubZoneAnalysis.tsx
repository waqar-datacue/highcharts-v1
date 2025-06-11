import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useAI } from "@/contexts/AIContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, LineChart, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Import types from HighchartsPerformance
export type SubZone = {
  id: string;
  name: string;
  nameAr: string;
  parentZone: 'North Riyadh' | 'South Riyadh' | 'East Riyadh' | 'West Riyadh' | 'Central Riyadh';
  salesData: number[];
  priceData: number[];
  population?: number;
  area?: number;
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

const SubZoneAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const { zoneName } = useParams<{ zoneName: string }>();
  const [searchParams] = useSearchParams();
  const analysisType = searchParams.get('type') || 'sales';
  const { t } = useTranslation();
  const { openAITray, isAITrayOpen } = useAI();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [zoneSubZoneData, setZoneSubZoneData] = useState<ZoneSubZoneData | null>(null);

  // Sub-zone data (copy from HighchartsPerformance)
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
      { id: 'sr002', name: 'Al Difa', nameAr: 'الضباط', parentZone: 'South Riyadh', salesData: [0.13, 0.15, 0.12, 0.16, 0.14, 0.17], priceData: [4.4, 4.6, 4.5, 4.8, 4.7, 5.0], population: 74000, area: 13.7 }
    ],
    'East Riyadh': [
      { id: 'er001', name: 'Al Khalidiyah', nameAr: 'الخالدية', parentZone: 'East Riyadh', salesData: [0.12, 0.14, 0.11, 0.15, 0.13, 0.16], priceData: [4.2, 4.4, 4.3, 4.6, 4.5, 4.8], population: 73000, area: 12.6 }
    ],
    'West Riyadh': [
      { id: 'wr001', name: 'Al Shifa', nameAr: 'الشفا', parentZone: 'West Riyadh', salesData: [0.09, 0.11, 0.08, 0.12, 0.10, 0.13], priceData: [4.0, 4.2, 4.1, 4.4, 4.3, 4.6], population: 61000, area: 10.5 }
    ],
    'Central Riyadh': [
      { id: 'cr001', name: 'Al Malaz', nameAr: 'الملز', parentZone: 'Central Riyadh', salesData: [0.16, 0.18, 0.15, 0.19, 0.17, 0.20], priceData: [4.6, 4.8, 4.7, 5.0, 4.9, 5.2], population: 95000, area: 18.3 }
    ]
  };

  // Generate zone data
  const generateZoneSubZoneData = (zoneName: string): ZoneSubZoneData => {
    const zoneNameMapping: Record<string, string> = {
      'North Riyadh': 'شمال الرياض',
      'South Riyadh': 'جنوب الرياض', 
      'East Riyadh': 'شرق الرياض',
      'West Riyadh': 'غرب الرياض',
      'Central Riyadh': 'وسط الرياض'
    };
    
    const subZones = SUB_ZONES_DATA[zoneName] || [];
    
    const totalZoneSales = subZones.reduce((sum, subZone) => 
      sum + subZone.salesData.reduce((subSum, val) => subSum + val, 0), 0
    );
    
    const performances: SubZonePerformance[] = subZones.map(subZone => {
      const totalSales = subZone.salesData.reduce((sum, val) => sum + val, 0);
      const avgPrice = subZone.priceData.reduce((sum, val) => sum + val, 0) / subZone.priceData.length;
      const percentageContribution = (totalSales / totalZoneSales) * 100;
      
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
    
    const sortedPerformances = performances.sort((a, b) => b.totalSales - a.totalSales);
    const top10 = sortedPerformances.slice(0, 10);
    const othersData = sortedPerformances.slice(10);
    
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

  // Load data and auto-open AI pane
  useEffect(() => {
    if (zoneName) {
      setIsLoadingData(true);
      
      setTimeout(() => {
        const data = generateZoneSubZoneData(decodeURIComponent(zoneName));
        setZoneSubZoneData(data);
        setIsLoadingData(false);
        
        // Auto-open AI pane with zone data
        if (!isAITrayOpen) {
          openAITray({
            id: `sub-zone-analysis-${zoneName}`,
            title: `${analysisType === 'sales' ? 'Sales' : 'Price'} Analysis - ${zoneName}`,
            type: "widget",
            data: data,
            category: "Highcharts Sub-Zone Analysis"
          });
          
          toast.success(`AI Analysis opened for ${zoneName} sub-zones`);
        }
      }, 800);
    }
  }, [zoneName, analysisType, openAITray, isAITrayOpen]);

  const handleBack = () => {
    navigate('/highcharts-performance');
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-lg">Loading {zoneName} sub-zone analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={16} />
                <span>Back to Highcharts Performance</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${analysisType === 'sales' ? 'bg-blue-100' : 'bg-green-100'}`}>
                  {analysisType === 'sales' ? (
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  ) : (
                    <LineChart className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {analysisType === 'sales' ? 'Sales' : 'Price'} Analysis - {zoneName}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Detailed sub-zone performance breakdown
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-datacue-primary hover:bg-datacue-accent/20"
            >
              <Sparkles size={16} />
              <span>AI Analysis Active</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {zoneSubZoneData && (
          <div className="space-y-6">
            {/* Zone Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`bg-gradient-to-r ${analysisType === 'sales' ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-green-50 to-green-100 border-green-200'} p-6 rounded-lg border`}>
                <h4 className={`font-semibold ${analysisType === 'sales' ? 'text-blue-800' : 'text-green-800'}`}>
                  {analysisType === 'sales' ? 'Total Sales' : 'Average Zone Price'}
                </h4>
                <p className={`text-3xl font-bold ${analysisType === 'sales' ? 'text-blue-900' : 'text-green-900'}`}>
                  {analysisType === 'sales' 
                    ? `${zoneSubZoneData.totalZoneSales.toFixed(1)}M SAR`
                    : `${zoneSubZoneData.avgZonePrice.toFixed(2)} SAR`
                  }
                </p>
              </div>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800">
                  {analysisType === 'sales' ? 'Average Price' : 'Total Sales'}
                </h4>
                <p className="text-3xl font-bold text-gray-900">
                  {analysisType === 'sales' 
                    ? `${zoneSubZoneData.avgZonePrice.toFixed(2)} SAR`
                    : `${zoneSubZoneData.totalZoneSales.toFixed(1)}M SAR`
                  }
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800">Sub-Zones</h4>
                <p className="text-3xl font-bold text-purple-900">
                  {zoneSubZoneData.subZones.length}
                </p>
                <p className="text-sm text-purple-700 mt-1">
                  Top 10 + {zoneSubZoneData.others.count} Others
                </p>
              </div>
            </div>

            {/* Sub-Zones Table */}
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 border-b bg-gray-50 rounded-t-lg">
                <h4 className="text-lg font-semibold text-gray-800">
                  Top Sub-Zones by {analysisType === 'sales' ? 'Sales Performance' : 'Average Price'}
                </h4>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Sub-Zone</TableHead>
                      <TableHead>{analysisType === 'sales' ? 'Total Sales' : 'Average Price'}</TableHead>
                      <TableHead>{analysisType === 'sales' ? 'Average Price' : 'Total Sales'}</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead>Population</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zoneSubZoneData.top10.map((performance, index) => (
                      <TableRow key={performance.subZone.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index < 3 
                              ? (analysisType === 'sales' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800')
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{performance.subZone.name}</p>
                            <p className="text-xs text-gray-500" dir="rtl">{performance.subZone.nameAr}</p>
                          </div>
                        </TableCell>
                        <TableCell className={`font-semibold ${analysisType === 'price' ? 'text-green-700' : ''}`}>
                          {analysisType === 'sales' 
                            ? `${performance.totalSales.toFixed(2)}M SAR`
                            : `${performance.avgPrice.toFixed(2)} SAR`
                          }
                        </TableCell>
                        <TableCell>
                          {analysisType === 'sales' 
                            ? `${performance.avgPrice.toFixed(2)} SAR`
                            : `${performance.totalSales.toFixed(2)}M SAR`
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            performance.trend === 'up' ? 'default' : 
                            performance.trend === 'down' ? 'destructive' : 'secondary'
                          }>
                            {performance.trend === 'up' ? '↗️ Up' : 
                             performance.trend === 'down' ? '↘️ Down' : '➡️ Stable'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {(performance.subZone.population || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubZoneAnalysis; 