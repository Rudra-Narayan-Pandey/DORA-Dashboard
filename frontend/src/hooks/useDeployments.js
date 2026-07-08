import { useState, useEffect, useContext, useCallback } from 'react';
import { FilterContext } from '../context/FilterContext';
import { getDeployments, triggerDeployment as apiTriggerDeployment } from '../services/deploymentService';

export const useDeployments = (initialPage = 1, limit = 5) => {
  const { filters } = useContext(FilterContext);
  const [deployments, setDeployments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: initialPage, limit, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);

  const fetchDeployments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDeployments({ ...filters, page, limit });
      setDeployments(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch deployment ledger.');
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    fetchDeployments();
  }, [fetchDeployments]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters.dateRange, filters.environment, filters.pipeline, filters.status, filters.search]);

  const triggerDeployment = async (data) => {
    try {
      const response = await apiTriggerDeployment(data);
      await fetchDeployments();
      return response;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    deployments,
    pagination,
    loading,
    error,
    page,
    setPage,
    refetch: fetchDeployments,
    triggerDeployment
  };
};
export default useDeployments;
