import api from './api';

export const getIncidents = async (filters = {}) => {
  try {
    const response = await api.get('/incidents', { params: filters });
    return response.data;
  } catch (error) {
    console.error('API error fetching incidents:', error);
    throw error;
  }
};

export const createIncident = async (incidentData) => {
  try {
    const response = await api.post('/incidents', incidentData);
    return response.data;
  } catch (error) {
    console.error('API error creating incident:', error);
    throw error;
  }
};

export const resolveIncident = async (incidentId) => {
  try {
    const response = await api.put(`/incidents/${incidentId}/resolve`);
    return response.data;
  } catch (error) {
    console.error('API error resolving incident:', error);
    throw error;
  }
};
