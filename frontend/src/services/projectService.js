import api from './api';
import { formatDisplayName } from '../utils/displayNames';

export const getProjects = async () => {
  const response = await api.get('/projects');
  const projects = Array.isArray(response.data) ? response.data : [];
  return projects.map((project) => ({
    ...project,
    displayName: formatDisplayName(project.name, project.name)
  }));
};
