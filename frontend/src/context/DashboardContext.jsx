import React, { createContext, useState, useEffect, useContext } from 'react';
import { FilterContext } from './FilterContext';
import { getMetrics, getTrends } from '../services/metricsService';
import { getDeployments } from '../services/deploymentService';
import { getIncidents } from '../services/incidentService';

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const { filters } = useContext(FilterContext);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [metrics, setMetrics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [deploymentsData, setDeploymentsData] = useState(null);
  const [incidentsData, setIncidentsData] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch metrics (incorporates time window/filters)
      const metricsRes = await getMetrics(filters);
      setMetrics(metricsRes);

      // Fetch trends (weekly/monthly based on dateRange selection)
      const period = filters.dateRange === '30d' || filters.dateRange === '90d' || filters.dateRange === 'all' ? 'monthly' : 'weekly';
      const trendsRes = await getTrends(period);
      setTrends(trendsRes);

      // Fetch first page of deployments & incidents
      const deploymentsRes = await getDeployments({ ...filters, page: 1, limit: 5 });
      setDeploymentsData(deploymentsRes);

      const incidentsRes = await getIncidents({ ...filters, page: 1, limit: 5 });
      setIncidentsData(incidentsRes);
    } catch (err) {
      console.error("Dashboard context load error:", err);
      setError("Failed to synchronize with control center feed.");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when global filters change
  useEffect(() => {
    fetchDashboardData();
  }, [filters.dateRange, filters.environment]); // Only re-fetch core metrics on date/env updates

  return (
    <DashboardContext.Provider
      value={{
        loading,
        error,
        metrics,
        trends,
        deploymentsData,
        incidentsData,
        refreshData: fetchDashboardData,
        setDeploymentsData,
        setIncidentsData
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
