import api from './api';
import incidentsMock from '../data/incidents.json';
import { sleep } from '../utils/helpers';

export const getIncidents = async (filters = {}) => {
  try {
    await sleep(650);
    // In production:
    // const response = await api.get('/incidents', { params: filters });
    // return response.data;

    let list = [...incidentsMock];

    if (filters.severity && filters.severity !== 'All') {
      list = list.filter(i => i.severity.toLowerCase() === filters.severity.toLowerCase());
    }
    if (filters.status && filters.status !== 'All') {
      list = list.filter(i => i.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.environment && filters.environment !== 'All') {
      list = list.filter(i => i.environment.toLowerCase() === filters.environment.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(i => 
        i.id.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.pipeline.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q))
      );
    }

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
    console.error('API error fetching incidents:', error);
    return {
      data: [],
      pagination: { total: 0, page: 1, limit: 5, pages: 0 }
    };
  }
};

export const createIncident = async (incidentData) => {
  try {
    await sleep(800);
    const newInc = {
      id: `INC-${Math.floor(4000 + Math.random() * 1000)}`,
      title: incidentData.title,
      severity: incidentData.severity || 'major',
      status: 'investigating',
      pipeline: incidentData.pipeline || 'Core API Gateway',
      environment: incidentData.environment || 'Production',
      detectedAt: new Date().toISOString(),
      resolvedAt: null,
      duration: null,
      description: incidentData.description || 'No description provided.',
      actionItems: []
    };
    incidentsMock.unshift(newInc);
    return newInc;
  } catch (error) {
    console.error('API error creating incident:', error);
    throw error;
  }
};

export const resolveIncident = async (incidentId) => {
  try {
    await sleep(600);
    const incidentIndex = incidentsMock.findIndex(i => i.id === incidentId);
    if (incidentIndex !== -1) {
      const resolvedAt = new Date().toISOString();
      const detected = new Date(incidentsMock[incidentIndex].detectedAt);
      const diffMins = Math.floor((new Date(resolvedAt) - detected) / 60000);
      
      incidentsMock[incidentIndex] = {
        ...incidentsMock[incidentIndex],
        status: 'resolved',
        resolvedAt,
        duration: diffMins || 1
      };
      return incidentsMock[incidentIndex];
    }
    throw new Error('Incident not found');
  } catch (error) {
    console.error('API error resolving incident:', error);
    throw error;
  }
};
