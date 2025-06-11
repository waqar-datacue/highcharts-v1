import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Download, BarChart, LineChart, PieChart, Table, Sparkles, X, GripVertical } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useAI } from "../../contexts/AIContext";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";

export type VisualizationType = "line" | "bar" | "pie" | "table";

interface WidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  allowChangeVisualization?: boolean;
  data?: any;
  category?: string;
  categoryDisplayName?: string;
  visualizationType?: VisualizationType;
  onVisualizationChange?: (type: VisualizationType) => void;
  isFixed?: boolean;
  onRemove?: () => void;
  className?: string;
  hideButtons?: boolean;
  showDownloadButton?: boolean;
  showAIButton?: boolean;
}

const Widget: React.FC<WidgetProps> = ({
  id,
  title,
  children,
  allowChangeVisualization = false,
  data,
  category,
  categoryDisplayName,
  visualizationType = "line",
  onVisualizationChange,
  isFixed = false,
  onRemove,
  className,
  hideButtons = false,
  showDownloadButton = true,
  showAIButton = true,
}) => {
  const { openAITray, isAITrayOpen } = useAI();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [currentVisualization, setCurrentVisualization] = useState<VisualizationType>(visualizationType);

  // Check category access using the untranslated category ID
  const hasCategoryAccess = user?.categories?.includes(category || "");

  useEffect(() => {
    if (onVisualizationChange) {
      onVisualizationChange(currentVisualization);
    }
  }, [currentVisualization, onVisualizationChange]);

  const handleAIClick = (e: React.MouseEvent) => {
    // Important: Prevent the event from propagating to parent elements 
    // to avoid triggering drag behavior
    e.preventDefault();
    e.stopPropagation();
    
    if (!hasCategoryAccess) {
      toast.error(t('common.error') + ': ' + t('common.no_access'));
      return;
    }

    try {
      console.log("Opening AI Tray with widget data:", {
        id,
        title,
        type: "widget",
        data: data || {},
        category: category || "Default"
      });
      
      // Directly open AI tray with widget data
      openAITray({
        id,
        title,
        type: "widget",
        data: data || {},
        category: category || "Default",
      });
      
      // Show success notification
      toast.success(`${t('common.success')}: ${t('common.ai_insights_opened')} ${title}`);
    } catch (error) {
      console.error("Error opening AI tray:", error);
      toast.error(t('common.ai_error'));
    }
  };

  const handleCSVDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hasCategoryAccess) {
      toast.error(t('common.error') + ': ' + t('common.no_access'));
      return;
    }

    toast.success(`${t('common.downloading')} ${title} ${t('common.as_csv')}`);
    // In a real app, we'd implement actual CSV download here
  };

  const handleChangeVisualization = (type: VisualizationType) => {
    if (!hasCategoryAccess) {
      toast.error(t('common.error') + ': ' + t('common.no_access'));
      return;
    }

    setCurrentVisualization(type);
    toast.info(`${t('common.changed')} ${title} ${t('common.visualization_to')} ${type}`);
  };

  if (!hasCategoryAccess) {
    return null;
  }

  // Display translated category name if provided, otherwise use category
  const displayCategory = categoryDisplayName || category;

  return (
    <Card className={cn(
      "shadow-sm border-gray-200 h-full w-full flex flex-col",
      isFixed ? "bg-white border-datacue-accent/20" : "bg-white",
      className
    )}>
      <CardHeader className={cn(
        "pb-2 pt-4 px-4 flex flex-row items-center justify-between",
        isFixed && "bg-datacue-accent/5"
      )}>
        <div className="flex items-center draggable-handle cursor-move">
          <GripVertical size={16} className={cn(isRTL ? "ms-2" : "me-2", "text-gray-400")} />
          <CardTitle className="text-md font-medium text-datacue-primary">
            {title}
            {isFixed && (
              <span className={cn(isRTL ? "me-2" : "ms-2", "text-xs text-datacue-accent")}>
                ({t('common.fixed')})
              </span>
            )}
          </CardTitle>
        </div>
        {!hideButtons && (
          <div className="flex items-center space-x-1">
            {allowChangeVisualization && !isFixed && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-datacue-accent/20 transition-colors duration-200"
                    onClick={(e) => e.stopPropagation()}
                    draggable="false"
                  >
                    {currentVisualization === "line" && <LineChart size={16} />}
                    {currentVisualization === "bar" && <BarChart size={16} />}
                    {currentVisualization === "pie" && <PieChart size={16} />}
                    {currentVisualization === "table" && <Table size={16} />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "start" : "end"}>
                  <DropdownMenuItem onClick={() => handleChangeVisualization("line")}>
                    <LineChart size={16} className={cn(isRTL ? "ms-2" : "me-2")} /> 
                    {t('widgets.line_chart')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleChangeVisualization("bar")}>
                    <BarChart size={16} className={cn(isRTL ? "ms-2" : "me-2")} /> 
                    {t('widgets.bar_chart')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleChangeVisualization("pie")}>
                    <PieChart size={16} className={cn(isRTL ? "ms-2" : "me-2")} /> 
                    {t('widgets.pie_chart')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleChangeVisualization("table")}>
                    <Table size={16} className={cn(isRTL ? "ms-2" : "me-2")} /> 
                    {t('widgets.table_view')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove();
                }}
                className="h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors duration-200"
                draggable="false"
              >
                <X size={16} />
              </Button>
            )}
            {showDownloadButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCSVDownload}
                className="h-8 w-8 rounded-full hover:bg-datacue-accent/20 transition-colors duration-200"
                draggable="false"
                aria-label={t('common.download')}
              >
                <Download size={16} />
              </Button>
            )}
            {showAIButton && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleAIClick}
                className="h-8 w-8 rounded-full text-datacue-primary hover:bg-datacue-accent/20 transition-all duration-200 group"
                title={t('common.open_ai_insights')}
                aria-label={t('common.open_ai_insights')}
                draggable="false"
              >
                <Sparkles size={16} className="group-hover:scale-110 transition-transform duration-200" />
              </Button>
            )}

          </div>
        )}
      </CardHeader>
      <CardContent className="pt-2 pb-3 px-4 flex-1 min-h-[120px]">
        <div className="w-full h-full">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default Widget;
