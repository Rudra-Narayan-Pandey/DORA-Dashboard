import api from './api';

export const getDeployments = async (filters = {}) => {
  try {
    const response = await api.get('/deployments', { params: filters });
    return response.data;
  } catch (error) {
    console.error('API error fetching deployments:', error);
    throw error;
  }
};

export const triggerDeployment = async (deploymentData) => {
  try {
    const response = await api.post('/deployments', deploymentData);
    return response.data;
  } catch (error) {
    console.error('API error triggering deployment:', error);
    throw error;
  }
};
