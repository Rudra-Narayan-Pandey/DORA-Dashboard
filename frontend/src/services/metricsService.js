import api from './api';
import metricsMock from '../data/metrics.json';
import trendsMock from '../data/trends.json';
import { sleep } from '../utils/helpers';

export const getMetrics = async (filters = {}) => {
  try {
    // Simulated network delay
    await sleep(600);
    // In production, you would do:
    // const response = await api.get('/metrics', { params: filters });
    // return response.data;
    return metricsMock;
  } catch (error) {
    console.error('API error fetching metrics:', error);
    return metricsMock;
  }
};

export const getTrends = async (period = 'weekly') => {
  try {
    await sleep(500);
    // In production, you would do:
    // const response = await api.get(`/metrics/trends/${period}`);
    // return response.data;
    return trendsMock[period] || trendsMock.weekly;
  } catch (error) {
    console.error('API error fetching trends:', error);
    return trendsMock[period] || trendsMock.weekly;
  }
};
