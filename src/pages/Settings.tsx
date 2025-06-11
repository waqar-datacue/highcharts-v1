import React from "react";
import { useTranslation } from "react-i18next";

const Settings: React.FC = () => {
  const { t } = useTranslation("common");
  
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-semibold text-datacue-primary">{t("settings.title")}</h1>
        <p className="text-datacue-primary/70">
          {t("settings.subtitle")}
        </p>
      </div>
      
      <div className="flex items-center justify-center h-64 bg-white border rounded-lg">
        <p className="text-datacue-primary/70">
          {t("settings.coming_soon")}
        </p>
      </div>
    </div>
  );
};

export default Settings;
