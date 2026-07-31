import api from './api';

const getIncomes = async (params = {}) => {
  const cleanParams = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== '') {
      cleanParams[key] = params[key];
    }
  });

  const response = await api.get('/income', { params: cleanParams });
  return response.data;
};

const createIncome = async (incomeData) => {
  const response = await api.post('/income', incomeData);
  return response.data;
};

const updateIncome = async (id, incomeData) => {
  const response = await api.put(`/income/${id}`, incomeData);
  return response.data;
};

const deleteIncome = async (id) => {
  const response = await api.delete(`/income/${id}`);
  return response.data;
};

export default {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
};
