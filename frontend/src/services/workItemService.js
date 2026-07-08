import api from './api';

export const getWorkItems = async () => {
  const response = await api.get('/work-items');
  return Array.isArray(response.data) ? response.data : [];
};
