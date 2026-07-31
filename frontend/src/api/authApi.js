import api from './api';

const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({
      _id: response.data._id,
      name: response.data.name,
      email: response.data.email,
    }));
  }
  return response.data;
};

const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({
      _id: response.data._id,
      name: response.data.name,
      email: response.data.email,
    }));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({
      _id: response.data._id,
      name: response.data.name,
      email: response.data.email,
    }));
  }
  return response.data;
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  getProfile,
  updateProfile,
};
