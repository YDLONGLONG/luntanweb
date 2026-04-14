import axios from 'axios';
import { Message } from 'element-ui';
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

service.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let message = '请求失败';
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          message = data?.message || '请求参数错误';
          break;
        case 401:
          message = '未授权，请重新登录';
          store.dispatch('logout');
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = '请求资源不存在';
          break;
        case 500:
          message = data?.message || '服务器内部错误';
          break;
        default:
          message = data?.message || `请求失败 (${status})`;
      }
    } else if (error.request) {
      message = '网络连接失败，请检查网络';
    } else {
      message = error.message || '请求配置错误';
    }
    
    Message.error(message);
    return Promise.reject(error);
  }
);

export default service;
