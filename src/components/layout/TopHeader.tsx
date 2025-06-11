
import React from "react";
import { useDataContext } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Bell, UserCircle, Loader2, Shield } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { useTranslation } from 'react-i18next';

const TopHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    filters,
    setLanguage,
    isLoading
  } = useDataContext();
  const { t } = useTranslation();
  const isRTL = filters.language === "AR";

  const handleLanguageToggle = () => {
    const newLanguage = filters.language === "EN" ? "AR" : "EN";
    setLanguage(newLanguage);
  };

  return (
    <header className="bg-white shadow-sm py-2 px-3">
      <div className="flex items-center justify-between">
        {/* Empty div for spacing */}
        <div className="w-2"></div>

        {/* Loading indicator only */}
        <div className="flex items-center">
          {isLoading && (
            <div className="flex items-center text-datacue-primary">
              <Loader2 className="h-4 w-4 animate-spin me-1" />
              <span className="text-xs">{t('common.loading')}</span>
            </div>
          )}
        </div>

        {/* User Menu & Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLanguageToggle}
            className="rounded-full w-7 h-7"
            disabled={isLoading}
            aria-label={t('header.language_switch')}
          >
            <span className="font-medium text-sm">
              {filters.language === "EN" ? "AR" : "EN"}
            </span>
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full w-7 h-7"
            onClick={() => toast.info(t('header.notifications'))}
            aria-label={t('header.notifications')}
          >
            <Bell size={16} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 h-8 px-2">
                <UserCircle size={16} />
                <span className="hidden sm:block text-sm">
                  {user?.name || t('header.profile')}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"}>
              <div className="px-4 py-2">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <div className="mt-1 text-xs bg-datacue-accent px-2 py-1 rounded text-datacue-primary">
                  {t('common.categories')}: {user?.categories.join(", ")}
                </div>
                <div className="mt-1 text-xs bg-datacue-primary/10 px-2 py-1 rounded text-datacue-primary flex items-center">
                  <Shield size={12} className="me-1 h-3 w-3" />
                  {user?.subscriptionPlan || t('common.basic_plan')}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.info(t('common.coming_soon'))}>{t('header.settings')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info(t('common.coming_soon'))}>{t('header.help')}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>{t('header.sign_out')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
