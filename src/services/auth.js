import axios from 'axios';

const API_URL = 'https://inventory-managment-f86s.onrender.com';

const authApi = axios.create({
  baseURL: API_URL,
});

export const registerUser = (username, email, password) => {
  return authApi.post('/register', { username, email, password });
};

export const loginUser = (email, password) => {
  return authApi.post('/login', { email, password });
};

export const logoutUser = (token) => {
  return authApi.post('/logout', {}, {
    headers: { Authorization: token }
  });
};

export const verifyToken = (token) => {
  return authApi.get('/verify', {
    headers: { Authorization: token }
  });
};