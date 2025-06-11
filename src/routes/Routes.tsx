
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Performance from "../pages/Performance";
import CustomDashboards from "../pages/CustomDashboards";
import Settings from "../pages/Settings";
import NotFound from "../pages/NotFound";
import ExecutiveSummaryDemo from "../pages/ExecutiveSummaryDemo";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="performance" element={<Performance />} />
        <Route path="custom-dashboards" element={<CustomDashboards />} />
        <Route path="settings" element={<Settings />} />
        <Route path="executive-summary" element={<ExecutiveSummaryDemo />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
