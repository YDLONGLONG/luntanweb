import axios from 'axios';
import store from '../store';

const baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api';

const service = axios.create({
  baseURL
});

service.interceptors.request.use((config) => {
  const token = store.state.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default service;
