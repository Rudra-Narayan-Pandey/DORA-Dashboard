import api from './api';

export const getCurrentProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
