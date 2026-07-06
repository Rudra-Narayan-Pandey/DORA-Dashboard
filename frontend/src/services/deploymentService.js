import api from './api';
import deploymentsMock from '../data/deployments.json';
import { sleep } from '../utils/helpers';

export const getDeployments = async (filters = {}) => {
  try {
    await sleep(700);
    // In production, you would call:
    // const response = await api.get('/deployments', { params: filters });
    // return response.data;
    
    let list = [...deploymentsMock];
    
    // Apply Filters
    if (filters.environment && filters.environment !== 'All') {
      list = list.filter(d => d.environment.toLowerCase() === filters.environment.toLowerCase());
    }
    if (filters.pipeline && filters.pipeline !== 'All') {
      list = list.filter(d => d.pipeline.toLowerCase() === filters.pipeline.toLowerCase());
    }
    if (filters.status && filters.status !== 'All') {
      list = list.filter(d => d.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(d => 
        d.id.toLowerCase().includes(q) ||
        d.version.toLowerCase().includes(q) ||
        d.pipeline.toLowerCase().includes(q) ||
        d.triggeredBy.toLowerCase().includes(q) ||
        d.commit.toLowerCase().includes(q)
      );
    }
    
    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 5;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedList = list.slice(startIndex, endIndex);
    
    return {
      data: paginatedList,
      pagination: {
        total: list.length,
        page,
        limit,
        pages: Math.ceil(list.length / limit)
      }
    };
  } catch (error) {
    console.error('API error fetching deployments:', error);
    return {
      data: [],
      pagination: { total: 0, page: 1, limit: 5, pages: 0 }
    };
  }
};

export const triggerDeployment = async (deploymentData) => {
  try {
    await sleep(1000);
    // In production:
    // const response = await api.post('/deployments', deploymentData);
    // return response.data;
    const newDep = {
      id: `DEP-${Math.floor(1000 + Math.random() * 9000)}`,
      version: deploymentData.version || 'v1.0.0',
      environment: deploymentData.environment || 'Staging',
      pipeline: deploymentData.pipeline || 'Frontend Dashboard',
      status: 'success',
      triggeredBy: deploymentData.triggeredBy || 'Operator',
      timestamp: new Date().toISOString(),
      duration: Math.floor(120 + Math.random() * 200),
      commit: Math.random().toString(16).substring(2, 9),
      rollbacked: false
    };
    deploymentsMock.unshift(newDep);
    return newDep;
  } catch (error) {
    console.error('API error triggering deployment:', error);
    throw error;
  }
};
