import api from './api';

export const uploadReceipt = async (file) => {
  try {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await api.post('/expenses/ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to process receipt image';
  }
};
