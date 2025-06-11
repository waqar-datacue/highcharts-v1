
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { LayoutDashboard, LineChart, PieChart, Settings, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useTranslation } from "react-i18next";
import taashLogo from "../../assets/images/TAASH LOGO .png";

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isCollapsed: boolean;
  isActive: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  href,
  isCollapsed,
  isActive,
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={href}
            className={cn(
              "flex items-center py-3 px-3 my-1 rounded-md transition-colors",
              isActive
                ? "bg-datacue-primary text-white"
                : "text-gray-600 hover:bg-gray-200"
            )}
          >
            <Icon 
              size={20} 
              className={cn(
                isCollapsed ? "mx-auto" : isRTL ? "ms-2" : "me-2"
              )} 
            />
            {!isCollapsed && <span>{label}</span>}
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side={isRTL ? "left" : "right"} className="border-datacue-accent">
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar }) => {
  const location = useLocation();
  const { t, i18n } = useTranslation("common");
  const isRTL = i18n.language === 'ar';

  const sidebarItems = [
    {
      icon: LayoutDashboard,
      label: t("navigation.summary"),
      href: "/dashboard",
    },
    {
      icon: LineChart,
      label: t("navigation.performance"),
      href: "/performance",
    },
    {
      icon: TrendingUp,
      label: t("navigation.highcharts_performance"),
      href: "/highcharts-performance",
    },
    {
      icon: PieChart,
      label: t("navigation.custom_dashboards"),
      href: "/custom-dashboards",
    },
    {
      icon: Settings,
      label: t("navigation.settings"),
      href: "/settings",
    },
  ];

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo section */}
      <div className="flex flex-col items-center py-4 px-2">
        <div className={cn(
          "flex flex-col items-center gap-2",
          !collapsed && "flex-row"
        )}>
          <img 
            src={taashLogo} 
            alt="TAASH Logo" 
            className={cn(
              "w-auto object-contain",
              collapsed ? "h-10" : "h-12"
            )} 
          />
          <span className={cn(
            "text-xs bg-datacue-primary text-white px-2 py-1 rounded font-medium",
            collapsed ? "text-[10px] px-1" : "text-xs px-2"
          )}>
            BETA
          </span>
        </div>
      </div>

      <div className={cn(
        "flex items-center p-4",
        isRTL ? "justify-start" : "justify-end"
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full h-8 w-8"
        >
          {collapsed 
            ? (isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />)
            : (isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />)
          }
        </Button>
      </div>

      <div className="flex-1 py-4 px-3">
        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isCollapsed={collapsed}
              isActive={location.pathname === item.href}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
