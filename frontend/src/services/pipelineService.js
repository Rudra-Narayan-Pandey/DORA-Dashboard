import api from './api';
import { formatDisplayName } from '../utils/displayNames';

export const getPipelines = async () => {
  try {
    const response = await api.get('/pipelines');
    const pipelines = Array.isArray(response.data) ? response.data : [];
    return pipelines.map((pipeline) => ({
      ...pipeline,
      displayName: formatDisplayName(pipeline.name, pipeline.name)
    }));
  } catch (error) {
    console.error('API error fetching pipelines:', error);
    throw error;
  }
};

export const getBuilds = async (params = {}) => {
  try {
    const response = await api.get('/builds', { params });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('API error fetching builds:', error);
    throw error;
  }
};
