import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import TopHeader from "./TopHeader";
import Sidebar from "./Sidebar";
import AITray from "../ai/AITray";
import { useAI } from "../../contexts/AIContext";

const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { isAITrayOpen } = useAI();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-datacue-background">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header */}
        <TopHeader />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 transition-all duration-300">
          <div className={`mx-auto max-w-7xl ${isAITrayOpen ? 'mr-72' : ''}`}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* AI Tray */}
      <AITray />
    </div>
  );
};

export default AppLayout;
