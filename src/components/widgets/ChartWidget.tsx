import React, { useState, useEffect } from "react";
import { 
  BarChart as RechartBarChart, 
  LineChart as RechartLineChart, 
  PieChart as RechartPieChart,
  XAxis, YAxis, Tooltip, Legend, 
  Bar, Line, Pie, Cell, ResponsiveContainer,
  CartesianGrid, ReferenceLine, Area
} from "recharts";
import SaudiRiyalSymbol from "../SaudiRiyalSymbol";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type ChartType = "line" | "bar" | "pie" | "area" | "step";

// Updated chart colors to match exact brand palette
const DATACUE_COLORS = [
  '#16423C', // Primary - Dark teal
  '#6A9C89', // Secondary - Medium teal
  '#C4DAD2', // Accent - Light teal
  '#E9EFEC', // Background - Very light teal
  '#0F342E', // Darker variant of primary
  '#7FA896', // Lighter variant of secondary
  '#D1E4DD', // Lighter variant of accent
  '#F2F7F5', // Lighter variant of background
];

interface ChartWidgetProps {
  id: string;
  title: string;
  data: any[];
  dataKey: string;
  initialChartType?: ChartType;
  isCurrency?: boolean;
  className?: string;
  xAxisDataKey?: string;
  showSecondaryAxis?: boolean;
  secondaryDataKey?: string;
  secondaryName?: string;
  hideXAxis?: boolean;
  hideYAxis?: boolean;
  isHorizontal?: boolean;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({
  id,
  title,
  data,
  dataKey,
  initialChartType = "bar",
  isCurrency = false,
  className,
  xAxisDataKey = "name",
  showSecondaryAxis = false,
  secondaryDataKey,
  secondaryName,
  hideXAxis = false,
  hideYAxis = false,
  isHorizontal = false,
}) => {
  const [chartType, setChartType] = useState<ChartType>(initialChartType);
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  // Format numbers based on locale
  const formatValue = (value: number) => {
    const formatter = new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      notation: value > 10000 ? 'compact' : 'standard',
      maximumFractionDigits: 1
    });
    return formatter.format(value);
  };
  
  // Generate a custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
          <p className="text-sm font-medium text-gray-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {isCurrency ? 
                <span className="flex items-center">
                  <SaudiRiyalSymbol size={12} className={isRTL ? "ms-1" : "me-1"} />
                  {formatValue(entry.value)}
                </span> 
                : formatValue(entry.value)
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Format for Y axis ticks
  const formatYAxis = (value: number) => {
    return formatValue(value);
  };
  
  // Create a container class name that properly handles RTL layout
  const containerClassName = cn(
    "h-full w-full",
    isRTL && "rtl-chart-container", // Add a specific class for RTL charts
    className
  );
  
  // Calculate padding based on direction to ensure proper spacing
  const chartPadding = isRTL 
    ? { top: 5, right: 5, left: 20, bottom: 5 }
    : { top: 5, right: 20, left: 5, bottom: 5 };
    
  // Render different chart types based on the selected type
  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartBarChart
              data={data}
              layout={isHorizontal ? "vertical" : "horizontal"}
              margin={chartPadding}
            >
              {!hideXAxis && <XAxis 
                dataKey={isHorizontal ? undefined : xAxisDataKey} 
                type={isHorizontal ? "number" : "category"}
                tickFormatter={isHorizontal ? formatYAxis : undefined}
                tick={{ fontSize: 12 }}
                allowDataOverflow={false}
                interval="preserveStartEnd"
              />}
              {!hideYAxis && <YAxis 
                dataKey={isHorizontal ? xAxisDataKey : undefined} 
                type={isHorizontal ? "category" : "number"}
                tickFormatter={isHorizontal ? undefined : formatYAxis}
                tick={{ fontSize: 12 }}
                width={isRTL ? 50 : 40}
              />}
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey={dataKey} 
                fill={DATACUE_COLORS[0]} 
                name={title}
                radius={[4, 4, 0, 0]}
              />
              {showSecondaryAxis && secondaryDataKey && (
                <Bar 
                  dataKey={secondaryDataKey} 
                  fill={DATACUE_COLORS[1]} 
                  name={secondaryName || secondaryDataKey}
                  radius={[4, 4, 0, 0]}
                />
              )}
            </RechartBarChart>
          </ResponsiveContainer>
        );
        
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartLineChart
              data={data}
              margin={chartPadding}
            >
              {!hideXAxis && <XAxis 
                dataKey={xAxisDataKey} 
                tick={{ fontSize: 12 }}
                allowDataOverflow={false}
                interval="preserveStartEnd"
              />}
              {!hideYAxis && <YAxis 
                tickFormatter={formatYAxis} 
                tick={{ fontSize: 12 }} 
                width={isRTL ? 50 : 40}
              />}
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={DATACUE_COLORS[0]} 
                strokeWidth={2}
                name={title}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              {showSecondaryAxis && secondaryDataKey && (
                <Line 
                  type="monotone" 
                  dataKey={secondaryDataKey} 
                  stroke={DATACUE_COLORS[1]} 
                  strokeWidth={2}
                  name={secondaryName || secondaryDataKey}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              )}
            </RechartLineChart>
          </ResponsiveContainer>
        );
        
      case "step":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartLineChart
              data={data}
              margin={chartPadding}
            >
              {!hideXAxis && <XAxis 
                dataKey={xAxisDataKey} 
                tick={{ fontSize: 12 }}
                allowDataOverflow={false}
                interval="preserveStartEnd"
              />}
              {!hideYAxis && <YAxis 
                tickFormatter={formatYAxis} 
                tick={{ fontSize: 12 }} 
                width={isRTL ? 50 : 40}
              />}
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="stepAfter" 
                dataKey={dataKey} 
                stroke={DATACUE_COLORS[0]} 
                strokeWidth={2}
                name={title}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              {showSecondaryAxis && secondaryDataKey && (
                <Line 
                  type="stepAfter" 
                  dataKey={secondaryDataKey} 
                  stroke={DATACUE_COLORS[1]} 
                  strokeWidth={2}
                  name={secondaryName || secondaryDataKey}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              )}
            </RechartLineChart>
          </ResponsiveContainer>
        );
        
      case "area":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartLineChart
              data={data}
              margin={chartPadding}
            >
              {!hideXAxis && <XAxis 
                dataKey={xAxisDataKey} 
                tick={{ fontSize: 12 }}
                allowDataOverflow={false}
                interval="preserveStartEnd"
              />}
              {!hideYAxis && <YAxis 
                tickFormatter={formatYAxis} 
                tick={{ fontSize: 12 }} 
                width={isRTL ? 50 : 40}
              />}
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={DATACUE_COLORS[0]} 
                fill={DATACUE_COLORS[0] + "40"} // 40 = 25% opacity
                name={title}
              />
              {showSecondaryAxis && secondaryDataKey && (
                <Area 
                  type="monotone" 
                  dataKey={secondaryDataKey} 
                  stroke={DATACUE_COLORS[1]} 
                  fill={DATACUE_COLORS[1] + "40"} // 40 = 25% opacity
                  name={secondaryName || secondaryDataKey}
                />
              )}
            </RechartLineChart>
          </ResponsiveContainer>
        );
        
      case "pie":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartPieChart margin={chartPadding}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                innerRadius={0}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={xAxisDataKey}
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={DATACUE_COLORS[index % DATACUE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RechartPieChart>
          </ResponsiveContainer>
        );
        
      default:
        return <div>Unsupported chart type</div>;
    }
  };
  
  return (
    <div className={containerClassName}>
      {renderChart()}
    </div>
  );
};

export default ChartWidget;
