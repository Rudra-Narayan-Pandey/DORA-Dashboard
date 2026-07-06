import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import Dashboard from '../pages/Dashboard/Dashboard';
import Deployments from '../pages/Deployments/Deployments';
import Incidents from '../pages/Incidents/Incidents';
import Analytics from '../pages/Analytics/Analytics';
import Reports from '../pages/Reports/Reports';
import Settings from '../pages/Settings/Settings';
import NotFound from '../pages/NotFound/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/deployments" element={<Deployments />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
export default AppRoutes;
