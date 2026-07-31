import api from './api';

const getExpenses = async (params = {}) => {
  const cleanParams = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== '') {
      cleanParams[key] = params[key];
    }
  });

  const response = await api.get('/expenses', { params: cleanParams });
  return response.data;
};

const createExpense = async (expenseData) => {
  const response = await api.post('/expenses', expenseData);
  return response.data;
};

const updateExpense = async (id, expenseData) => {
  const response = await api.put(`/expenses/${id}`, expenseData);
  return response.data;
};

const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

export default {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
