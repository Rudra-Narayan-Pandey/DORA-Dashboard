import api from './api';

export const getMetrics = async (filters = {}) => {
  try {
    const response = await api.get('/metrics', { params: filters });
    return response.data;
  } catch (error) {
    console.error('API error fetching metrics:', error);
    throw error;
  }
};

export const getTrends = async (period = 'weekly', filters = {}) => {
  try {
    const response = await api.get(`/metrics/trends/${period}`, { params: filters });
    return response.data;
  } catch (error) {
    console.error('API error fetching trends:', error);
    throw error;
  }
};
