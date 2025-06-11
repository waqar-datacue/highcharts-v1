import React from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import { cn } from "../../lib/utils";
import SaudiRiyalSymbol from "../SaudiRiyalSymbol";
import { useTranslation } from "react-i18next";

interface MetricWidgetProps {
  title?: string;
  value: string | number;
  change?: number;
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
  className?: string;
  showTitle?: boolean;
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({
  title,
  value,
  change,
  prefix,
  suffix,
  isCurrency = false,
  className,
  showTitle = false
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  // Format the display value based on the props and locale
  const formatValue = () => {
    if (typeof value === 'string') {
      return value;
    }
    
    if (typeof value === 'number') {
      // Format with thousand separators using the current locale
      const formatter = new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      });
      
      return formatter.format(value);
    }
    
    return value;
  };
  
  const formattedValue = formatValue();
  
  // Format change percentage
  const formatChange = (changeValue: number) => {
    const formatter = new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    });
    
    return formatter.format(Math.abs(changeValue));
  };
  
  return (
    <div className={cn("w-full h-full flex flex-col px-2", className)}>
      {showTitle && title && (
        <div className="text-sm text-datacue-primary/80 mb-1">
          {title}
        </div>
      )}
      
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center">
          {isCurrency && (
            <div className={cn("flex-shrink-0", isRTL ? "ms-1" : "me-1")}>
              <SaudiRiyalSymbol size={18} className="text-datacue-primary" />
            </div>
          )}
          {prefix && <span className={isRTL ? "ms-1" : "me-1"}>{prefix}</span>}
          <span className="text-2xl font-bold text-datacue-primary">
            {formattedValue}
          </span>
          {suffix && <span className={isRTL ? "me-1" : "ms-1"}>{suffix}</span>}
        </div>
        
        {typeof change === 'number' && (
          <div className="flex items-center mt-1">
            <span
              className={cn(
                "flex items-center text-xs font-medium",
                change > 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {change > 0 ? (
                <ArrowUpIcon className={cn("h-3 w-3", isRTL ? "ms-1" : "me-1")} />
              ) : (
                <ArrowDownIcon className={cn("h-3 w-3", isRTL ? "ms-1" : "me-1")} />
              )}
              {change > 0 ? "+" : ""}
              {formatChange(change)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricWidget;
