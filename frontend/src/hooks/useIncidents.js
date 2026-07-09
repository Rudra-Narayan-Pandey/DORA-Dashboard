import { useState, useEffect, useContext, useCallback } from 'react';
import { FilterContext } from '../context/FilterContext';
import { getIncidents, createIncident as apiCreateIncident, resolveIncident as apiResolveIncident } from '../services/incidentService';

export const useIncidents = (initialPage = 1, limit = 5) => {
  const { filters } = useContext(FilterContext);
  const [incidents, setIncidents] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: initialPage, limit, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getIncidents({ ...filters, page, limit });
      setIncidents(result?.data || []);
      setPagination(result?.pagination || { total: 0, page, limit, pages: 0 });
    } catch (err) {
      console.error(err);
      setError('Failed to query incidents ledger.');
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);
    fetchIncidents();
  }, [fetchIncidents]);

  useEffect(() => {
    setPage(1);
  }, [filters.dateRange, filters.environment, filters.pipeline, filters.status, filters.search]);

  const createIncident = async (data) => {
    try {
      const response = await apiCreateIncident(data);
      await fetchIncidents();
      return response;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const resolveIncident = async (id) => {
    try {
      const response = await apiResolveIncident(id);
      await fetchIncidents();
      return response;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    incidents,
    pagination,
    loading,
    error,
    page,
    setPage,
    refetch: fetchIncidents,
    createIncident,
    resolveIncident
  };
};
export default useIncidents;
