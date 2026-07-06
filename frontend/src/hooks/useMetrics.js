import { useContext } from 'react';
import { DashboardContext } from '../context/DashboardContext';

export const useMetrics = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useMetrics must be used within a DashboardProvider');
  }
  return {
    metrics: context.metrics,
    trends: context.trends,
    loading: context.loading,
    error: context.error,
    refreshMetrics: context.refreshData
  };
};
