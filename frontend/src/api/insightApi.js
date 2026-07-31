import api from './api';

export const getAIInsights = async () => {
  try {
    const response = await api.get('/dashboard/insights');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch AI insights';
  }
};
